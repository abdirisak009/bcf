package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/notify"
	"github.com/bararug/website-backend/internal/pdf"
	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type FreeTrainingHandler struct {
	svc *services.FreeTrainingService
	cfg *config.Config
}

func NewFreeTrainingHandler(svc *services.FreeTrainingService, cfg *config.Config) *FreeTrainingHandler {
	return &FreeTrainingHandler{svc: svc, cfg: cfg}
}

// PublicListActive lists active programs for the public hub.
func (h *FreeTrainingHandler) PublicListActive(c *gin.Context) {
	items, err := h.svc.ListProgramsPublic()
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"items": items})
}

// PublicGetBySlug returns one active program for the registration page.
func (h *FreeTrainingHandler) PublicGetBySlug(c *gin.Context) {
	slug := strings.TrimSpace(c.Param("slug"))
	p, err := h.svc.GetPublicBySlug(slug)
	if err != nil {
		if errors.Is(err, services.ErrFreeTrainingNotFound) || errors.Is(err, services.ErrFreeTrainingInactive) {
			pkgutils.Fail(c, http.StatusNotFound, "not found")
			return
		}
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, p)
}

type registerBody struct {
	FullName string  `json:"full_name" binding:"required"`
	Email    string  `json:"email" binding:"required"`
	Phone    string  `json:"phone"`
	Location string  `json:"location" binding:"required"`
	Gender   string  `json:"gender"`
	Message  *string `json:"message"`
}

// PublicRegister creates a registration for an active program.
func (h *FreeTrainingHandler) PublicRegister(c *gin.Context) {
	slug := strings.TrimSpace(c.Param("slug"))
	var body registerBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	reg, err := h.svc.Register(slug, body.FullName, body.Email, body.Phone, body.Location, strings.TrimSpace(body.Gender), body.Message)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrFreeTrainingNotFound), errors.Is(err, services.ErrFreeTrainingInactive):
			pkgutils.Fail(c, http.StatusNotFound, "not found")
		case errors.Is(err, services.ErrFreeTrainingInvalidSlug):
			pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		default:
			pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		}
		return
	}
	var success string
	prog, progErr := h.svc.GetProgramByID(reg.ProgramID)
	if progErr == nil && strings.TrimSpace(prog.SuccessMessage) != "" {
		success = strings.TrimSpace(prog.SuccessMessage)
	} else {
		success = services.DefaultSuccessMessage()
	}
	var progPtr *models.FreeTrainingProgram
	if progErr == nil {
		progPtr = prog
	}
	notify.FreeTrainingRegistrationSubmitted(h.cfg, reg, progPtr)
	pkgutils.OK(c, http.StatusCreated, gin.H{
		"registration":    reg,
		"success_message": success,
	})
}

// AdminListPrograms lists all programs (including inactive).
func (h *FreeTrainingHandler) AdminListPrograms(c *gin.Context) {
	items, err := h.svc.ListProgramsAdmin()
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"items": items})
}

func (h *FreeTrainingHandler) AdminCreateProgram(c *gin.Context) {
	var req models.FreeTrainingProgram
	if err := c.ShouldBindJSON(&req); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	if req.Slug == "" {
		req.Slug = services.NormalizeSlug(req.Title)
	}
	if err := h.svc.CreateProgram(&req); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusCreated, req)
}

func (h *FreeTrainingHandler) AdminGetProgram(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	p, err := h.svc.GetProgramByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	pkgutils.OK(c, http.StatusOK, p)
}

func (h *FreeTrainingHandler) AdminUpdateProgram(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var patch models.FreeTrainingProgram
	if err := c.ShouldBindJSON(&patch); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	if err := h.svc.UpdateProgram(id, &patch); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	fresh, _ := h.svc.GetProgramByID(id)
	pkgutils.OK(c, http.StatusOK, fresh)
}

func (h *FreeTrainingHandler) AdminDeleteProgram(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.svc.DeleteProgram(id); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *FreeTrainingHandler) AdminListRegistrations(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	sort := c.DefaultQuery("sort", "created_at")
	order := c.DefaultQuery("order", "desc")
	var programID *uuid.UUID
	if raw := strings.TrimSpace(c.Query("program_id")); raw != "" {
		id, err := uuid.Parse(raw)
		if err != nil {
			pkgutils.Fail(c, http.StatusBadRequest, "invalid program_id")
			return
		}
		programID = &id
	}
	items, err := h.svc.ListRegistrations(programID, sort, order, limit, offset)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"items": items})
}

type registrationPatchBody struct {
	Status     string  `json:"status"`
	AdminNotes *string `json:"admin_notes"`
	Gender     *string `json:"gender"`
}

func (h *FreeTrainingHandler) AdminPatchRegistration(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	before, err := h.svc.GetRegistration(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	var body registrationPatchBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	reg, err := h.svc.UpdateRegistration(id, body.Status, body.AdminNotes, body.Gender)
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	if reg != nil && before.Status != "precepts" && reg.Status == "precepts" {
		prog, _ := h.svc.GetProgramByID(reg.ProgramID)
		notify.FreeTrainingPreceptsNotice(h.cfg, reg, prog)
	}
	pkgutils.OK(c, http.StatusOK, reg)
}

func (h *FreeTrainingHandler) AdminDeleteRegistration(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.svc.DeleteRegistration(id); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"deleted": true})
}

type freeTrainingCertBody struct {
	Phone string `json:"phone" binding:"required"`
}

// PublicIssueCertificate returns a PDF certificate for an eligible free-training registration (phone must match registered number).
func (h *FreeTrainingHandler) PublicIssueCertificate(c *gin.Context) {
	slug := strings.TrimSpace(c.Param("slug"))
	var body freeTrainingCertBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	reg, prog, err := h.svc.FindRegistrationForCertificate(slug, body.Phone)
	if err != nil {
		if errors.Is(err, services.ErrCertificateDownloadDisabled) {
			pkgutils.Fail(c, http.StatusForbidden, "certificate download is not enabled for this program")
			return
		}
		if errors.Is(err, services.ErrInvalidPhoneForCertificate) {
			pkgutils.Fail(c, http.StatusBadRequest, "enter a valid phone number")
			return
		}
		if errors.Is(err, services.ErrFreeTrainingNotFound) || errors.Is(err, services.ErrFreeTrainingInactive) {
			pkgutils.Fail(c, http.StatusNotFound, "program not found")
			return
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			pkgutils.Fail(c, http.StatusNotFound, "no eligible registration for this phone. Use the number you registered with; you must be on the Participants list (Shortlisted or Precepts).")
			return
		}
		pkgutils.Fail(c, http.StatusNotFound, "could not issue certificate")
		return
	}
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
	sigImg := ""
	if prog.CertificateSignatureImageURL != nil {
		s := strings.TrimSpace(*prog.CertificateSignatureImageURL)
		if s != "" {
			sigImg = h.cfg.ResolvePublicAssetURL(s)
		}
	}
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
		pkgutils.Fail(c, http.StatusInternalServerError, "pdf generation failed")
		return
	}
	filename := fmt.Sprintf("certificate-%s.pdf", strings.ReplaceAll(certNo, "/", "-"))

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", `attachment; filename="`+filename+`"`)
	c.Header("Cache-Control", "no-store")
	c.Data(http.StatusOK, "application/pdf", out)
}
