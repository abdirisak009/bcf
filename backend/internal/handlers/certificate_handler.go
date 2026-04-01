package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/pdf"
	"github.com/bararug/website-backend/internal/repositories"
	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type CertificateHandler struct {
	appRepo      *repositories.ApplicationRepository
	freeTrainSvc *services.FreeTrainingService
	cfg          *config.Config
}

func NewCertificateHandler(appRepo *repositories.ApplicationRepository, freeTrainSvc *services.FreeTrainingService, cfg *config.Config) *CertificateHandler {
	return &CertificateHandler{appRepo: appRepo, freeTrainSvc: freeTrainSvc, cfg: cfg}
}

func certificateSignatureImageURL(cfg *config.Config, ptr *string) string {
	if cfg == nil || ptr == nil {
		return ""
	}
	s := strings.TrimSpace(*ptr)
	if s == "" {
		return ""
	}
	return cfg.ResolvePublicAssetURL(s)
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
	Phone                 string `json:"phone" binding:"required"`
	FromDate              string `json:"from_date"`
	ToDate                string `json:"to_date"`
	FreeTrainingProgramID string `json:"free_training_program_id"` // optional: pick one program when several free trainings match
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

// IssueByPhone finds an approved paid-training application by phone, or an eligible free-training participant (certificate toggle on, Shortlisted/Precepts).
// If several free trainings match, returns 422 with code multiple_free_trainings and a choices list unless free_training_program_id is sent.
func (h *CertificateHandler) IssueByPhone(c *gin.Context) {
	var body issueCertificateByPhoneBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	var programID *uuid.UUID
	if s := strings.TrimSpace(body.FreeTrainingProgramID); s != "" {
		id, err := uuid.Parse(s)
		if err != nil {
			pkgutils.Fail(c, http.StatusBadRequest, "invalid free_training_program_id")
			return
		}
		programID = &id
	}
	app, err := h.appRepo.FindForCertificateByPhone(body.Phone)
	if err == nil {
		h.respondCertificatePDF(c, app, "", "", body.FromDate, body.ToDate)
		return
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		pkgutils.Fail(c, http.StatusInternalServerError, "could not verify application")
		return
	}
	reg, prog, ftErr := h.freeTrainSvc.ResolveRegistrationForCertificateByPhone(body.Phone, programID)
	if ftErr == nil {
		h.respondFreeTrainingCertificatePDF(c, reg, prog)
		return
	}
	var multi *services.MultipleFreeTrainingCertificatesError
	if errors.As(ftErr, &multi) {
		pkgutils.FailWithData(c, http.StatusUnprocessableEntity, "Choose which free training certificate to download.", "multiple_free_trainings", gin.H{"choices": multi.Choices})
		return
	}
	if errors.Is(ftErr, services.ErrInvalidPhoneForCertificate) {
		pkgutils.Fail(c, http.StatusBadRequest, "enter a valid phone number")
		return
	}
	if errors.Is(ftErr, services.ErrCertificateDownloadDisabled) {
		pkgutils.Fail(c, http.StatusForbidden, "certificate download is not enabled for this program")
		return
	}
	if errors.Is(ftErr, gorm.ErrRecordNotFound) {
		pkgutils.Fail(c, http.StatusNotFound, "no approved application or eligible free-training registration for this phone — use the number you registered with, or contact us.")
		return
	}
	pkgutils.Fail(c, http.StatusNotFound, "could not issue certificate")
}

func (h *CertificateHandler) buildPaidCertificatePDFBytes(app *models.Application, fallbackFirst, fallbackLast, fromDate, toDate string) ([]byte, string, error) {
	if app.Training == nil || strings.TrimSpace(app.Training.Title) == "" {
		return nil, "", fmt.Errorf("training data missing")
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

	sigImg := ""
	if app.Training != nil {
		sigImg = certificateSignatureImageURL(h.cfg, app.Training.CertificateSignatureImageURL)
	}
	data := pdf.CertificateData{
		StudentName:                student,
		TrainingName:               app.Training.Title,
		FromDate:                   fromDisp,
		ToDate:                     toDisp,
		CertificateNo:              certNo,
		IssueDate:                  issueDisp,
		SignatoryName:              h.cfg.CertificateSignatoryName,
		SignatoryTitle:             h.cfg.CertificateSignatoryTitle,
		VerifyPublicBaseURL:        h.cfg.CertificateVerifyBaseURLForQR(),
		HeaderLogoURL:              h.cfg.CertificateLogoURL,
		SignatorySignatureImageURL: sigImg,
	}

	out, err := pdf.FillCertificateLikeRegistry(h.cfg.CertificateTemplateURL, data)
	if err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("certificate-%s.pdf", strings.ReplaceAll(certNo, "/", "-"))
	return out, filename, nil
}

func (h *CertificateHandler) buildFreeTrainingCertificatePDFBytes(reg *models.FreeTrainingRegistration, prog *models.FreeTrainingProgram) ([]byte, string, error) {
	student := strings.TrimSpace(reg.FullName)
	if student == "" {
		student = "Participant"
	}
	title := strings.TrimSpace(prog.Title)
	if title == "" {
		title = "Free training"
	}
	y := time.Now().UTC().Year()
	certNo := fmt.Sprintf("BCF-%d-FT-%s", y, strings.ToUpper(reg.ID.String()[:8]))
	fromDisp := time.Now().UTC().Format("Jan 2, 2006")
	toDisp := fromDisp
	issueDisp := fromDisp
	sigImg := certificateSignatureImageURL(h.cfg, prog.CertificateSignatureImageURL)
	data := pdf.CertificateData{
		StudentName:                student,
		TrainingName:               title,
		FromDate:                   fromDisp,
		ToDate:                     toDisp,
		CertificateNo:              certNo,
		IssueDate:                  issueDisp,
		SignatoryName:              h.cfg.CertificateSignatoryName,
		SignatoryTitle:             h.cfg.CertificateSignatoryTitle,
		VerifyPublicBaseURL:        h.cfg.CertificateVerifyBaseURLForQR(),
		HeaderLogoURL:              h.cfg.CertificateLogoURL,
		SignatorySignatureImageURL: sigImg,
	}
	out, err := pdf.FillCertificateLikeRegistry(h.cfg.CertificateTemplateURL, data)
	if err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("certificate-%s.pdf", strings.ReplaceAll(certNo, "/", "-"))
	return out, filename, nil
}

func (h *CertificateHandler) respondCertificatePDF(c *gin.Context, app *models.Application, fallbackFirst, fallbackLast, fromDate, toDate string) {
	out, filename, err := h.buildPaidCertificatePDFBytes(app, fallbackFirst, fallbackLast, fromDate, toDate)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, "pdf generation failed")
		return
	}
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", `attachment; filename="`+filename+`"`)
	c.Header("Cache-Control", "no-store")
	c.Data(http.StatusOK, "application/pdf", out)
}

func (h *CertificateHandler) respondFreeTrainingCertificatePDF(c *gin.Context, reg *models.FreeTrainingRegistration, prog *models.FreeTrainingProgram) {
	out, filename, err := h.buildFreeTrainingCertificatePDFBytes(reg, prog)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, "pdf generation failed")
		return
	}
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
