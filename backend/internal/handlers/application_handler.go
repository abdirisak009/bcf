package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/notify"
	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type ApplicationHandler struct {
	svc *services.ApplicationService
	cfg *config.Config
}

func NewApplicationHandler(svc *services.ApplicationService, cfg *config.Config) *ApplicationHandler {
	return &ApplicationHandler{svc: svc, cfg: cfg}
}

// Create is the same payload as Apply but requires dashboard auth — for manual entries.
func (h *ApplicationHandler) Create(c *gin.Context) {
	var req models.Application
	if err := c.ShouldBindJSON(&req); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	if err := h.svc.ApplyDashboardCreate(&req); err != nil {
		if errors.Is(err, services.ErrTrainingNotFound) {
			pkgutils.Fail(c, http.StatusNotFound, err.Error())
			return
		}
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	fresh, err := h.svc.GetByID(req.ID)
	if err == nil && fresh != nil {
		pkgutils.OK(c, http.StatusCreated, fresh)
		return
	}
	pkgutils.OK(c, http.StatusCreated, req)
}

type applyBody struct {
	TrainingID          uuid.UUID `json:"training_id" binding:"required"`
	Email               string    `json:"email" binding:"required,email"`
	ApplicantType       string    `json:"applicant_type"`
	FirstName           string    `json:"first_name"`
	LastName            string    `json:"last_name"`
	Phone               string    `json:"phone"`
	Company             string    `json:"company"`
	Message             string    `json:"message"`
	JobTitle            string    `json:"job_title"`
	EmployeeCountBand   string    `json:"employee_count_band"`
	EmployeeCountCustom string    `json:"employee_count_custom"`
	ParticipantCount    *int      `json:"participant_count"`
	ParticipantRoles    []string  `json:"participant_roles"`
	TrainingFormat      string    `json:"training_format"`
}

func applyBodyToModel(body applyBody) *models.Application {
	a := &models.Application{
		TrainingID:    body.TrainingID,
		Email:         strings.TrimSpace(strings.ToLower(body.Email)),
		ApplicantType: strings.TrimSpace(strings.ToLower(body.ApplicantType)),
	}
	if a.ApplicantType == "" {
		a.ApplicantType = "individual"
	}
	a.FirstName = strPtrOrNil(body.FirstName)
	a.LastName = strPtrOrNil(body.LastName)
	a.Phone = strPtrOrNil(body.Phone)
	a.Company = strPtrOrNil(body.Company)
	a.Message = messagePtr(body.Message)
	a.JobTitle = strPtrOrNil(body.JobTitle)
	a.EmployeeCountBand = strPtrOrNil(body.EmployeeCountBand)
	a.EmployeeCountCustom = strPtrOrNil(body.EmployeeCountCustom)
	a.ParticipantCount = body.ParticipantCount
	a.TrainingFormat = strPtrOrNil(body.TrainingFormat)
	if len(body.ParticipantRoles) > 0 {
		if b, err := json.Marshal(body.ParticipantRoles); err == nil {
			a.ParticipantRoles = datatypes.JSON(b)
		}
	}
	return a
}

func (h *ApplicationHandler) Apply(c *gin.Context) {
	var body applyBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	req := applyBodyToModel(body)
	if err := h.svc.Apply(req); err != nil {
		if errors.Is(err, services.ErrTrainingNotFound) {
			pkgutils.Fail(c, http.StatusNotFound, err.Error())
			return
		}
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusCreated, req)
}

func (h *ApplicationHandler) List(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	items, err := h.svc.List(limit, offset)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"items": items})
}

func (h *ApplicationHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	a, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	pkgutils.OK(c, http.StatusOK, a)
}

type applicationUpdateBody struct {
	Email                   string `json:"email" binding:"required"`
	FirstName               string `json:"first_name"`
	LastName                string `json:"last_name"`
	Phone                   string `json:"phone"`
	Company                 string `json:"company"`
	Message                 string `json:"message"`
	Status                  string `json:"status"`
	ApprovalWhatsAppMessage string `json:"approval_whatsapp_message"`
}

func strPtrOrNil(s string) *string {
	t := strings.TrimSpace(s)
	if t == "" {
		return nil
	}
	return &t
}

func messagePtr(s string) *string {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	return &s
}

func (h *ApplicationHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var body applicationUpdateBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	existing, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	prevStatus := strings.TrimSpace(existing.Status)
	existing.Email = strings.TrimSpace(strings.ToLower(body.Email))
	existing.FirstName = strPtrOrNil(body.FirstName)
	existing.LastName = strPtrOrNil(body.LastName)
	existing.Phone = strPtrOrNil(body.Phone)
	existing.Company = strPtrOrNil(body.Company)
	existing.Message = messagePtr(body.Message)
	becameApproved := false
	if st := strings.TrimSpace(body.Status); st != "" {
		existing.Status = st
		becameApproved = strings.EqualFold(st, "approved") && !strings.EqualFold(prevStatus, "approved")
	}
	if err := h.svc.Update(existing); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	fresh, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.OK(c, http.StatusOK, existing)
		return
	}
	if becameApproved && h.cfg != nil {
		notify.NotifyApplicantApproved(h.cfg, fresh, fresh.Training, body.ApprovalWhatsAppMessage)
	}
	pkgutils.OK(c, http.StatusOK, fresh)
}

func (h *ApplicationHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	if _, err := h.svc.GetByID(id); err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	if err := h.svc.Delete(id); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"deleted": true})
}
