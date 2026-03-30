package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/pdf"
	"github.com/bararug/website-backend/internal/repositories"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type CertificateHandler struct {
	appRepo *repositories.ApplicationRepository
	cfg     *config.Config
}

func NewCertificateHandler(appRepo *repositories.ApplicationRepository, cfg *config.Config) *CertificateHandler {
	return &CertificateHandler{appRepo: appRepo, cfg: cfg}
}

type issueCertificateBody struct {
	TrainingID string `json:"training_id" binding:"required"`
	Email      string `json:"email" binding:"required"`
	FirstName  string `json:"first_name" binding:"required"`
	LastName   string `json:"last_name" binding:"required"`
	FromDate   string `json:"from_date"` // YYYY-MM-DD optional
	ToDate     string `json:"to_date"`   // YYYY-MM-DD optional
}

type issueCertificateByPhoneBody struct {
	Phone    string `json:"phone" binding:"required"`
	FromDate string `json:"from_date"`
	ToDate   string `json:"to_date"`
}

// Issue verifies the training application (name + email) and returns a PDF certificate.
func (h *CertificateHandler) Issue(c *gin.Context) {
	var body issueCertificateBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	tid, err := uuid.Parse(strings.TrimSpace(body.TrainingID))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid training_id")
		return
	}

	app, err := h.appRepo.FindForCertificate(tid, body.Email, body.FirstName, body.LastName)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "no matching approved application — check your name, email, and training, or contact us if you recently applied.")
		return
	}
	h.respondCertificatePDF(c, app, body.FirstName, body.LastName, body.FromDate, body.ToDate)
}

// IssueByPhone finds an approved training application by phone (digits match) and returns a PDF certificate.
func (h *CertificateHandler) IssueByPhone(c *gin.Context) {
	var body issueCertificateByPhoneBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	app, err := h.appRepo.FindForCertificateByPhone(body.Phone)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "no approved application found for this phone number — use the number on your training application or contact us.")
		return
	}
	h.respondCertificatePDF(c, app, "", "", body.FromDate, body.ToDate)
}

func (h *CertificateHandler) respondCertificatePDF(c *gin.Context, app *models.Application, fallbackFirst, fallbackLast, fromDate, toDate string) {
	if app.Training == nil || strings.TrimSpace(app.Training.Title) == "" {
		pkgutils.Fail(c, http.StatusInternalServerError, "training data missing")
		return
	}

	fn := strings.TrimSpace(ptrStr(app.FirstName))
	ln := strings.TrimSpace(ptrStr(app.LastName))
	student := strings.TrimSpace(fn + " " + ln)
	if student == "" {
		student = strings.TrimSpace(fallbackFirst + " " + fallbackLast)
	}

	y := time.Now().UTC().Year()
	certNo := fmt.Sprintf("BCF-%d-%s", y, strings.ToUpper(app.ID.String()[:8]))

	fromDisp := pdf.FormatDisplayDate(fromDate)
	toDisp := pdf.FormatDisplayDate(toDate)
	issueDisp := time.Now().UTC().Format("Jan 2, 2006")

	data := pdf.CertificateData{
		StudentName:         student,
		TrainingName:        app.Training.Title,
		FromDate:            fromDisp,
		ToDate:              toDisp,
		CertificateNo:       certNo,
		IssueDate:           issueDisp,
		SignatoryName:       h.cfg.CertificateSignatoryName,
		SignatoryTitle:      h.cfg.CertificateSignatoryTitle,
		VerifyPublicBaseURL: h.cfg.CertificateVerifyBaseURL(),
		HeaderLogoURL:       h.cfg.CertificateLogoURL,
	}

	out, err := pdf.FillCertificateLikeRegistry(h.cfg.CertificateTemplateURL, data)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, "pdf generation failed")
		return
	}

	filename := fmt.Sprintf("certificate-%s.pdf", strings.ReplaceAll(certNo, "/", "-"))
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", `attachment; filename="`+filename+`"`)
	c.Header("Cache-Control", "no-store")
	c.Data(http.StatusOK, "application/pdf", out)
}

func ptrStr(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}
