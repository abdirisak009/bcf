package handlers

import (
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/middleware"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

var safeInvoiceFile = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)

type InvoiceHandler struct {
	svc *services.InvoiceService
}

func NewInvoiceHandler(svc *services.InvoiceService) *InvoiceHandler {
	return &InvoiceHandler{svc: svc}
}

type createInvoiceBody struct {
	ClientID   uuid.UUID  `json:"client_id" binding:"required"`
	ProjectID  *uuid.UUID `json:"project_id"`
	TrainingID *uuid.UUID `json:"training_id"`
	Amount     float64    `json:"amount" binding:"required,gte=0"`
	Currency   string     `json:"currency"`
	IssueDate  string     `json:"issue_date" binding:"required"`
	DueDate    string     `json:"due_date" binding:"required"`
	Notes      *string    `json:"notes"`
}

func parseDate(s string) (time.Time, error) {
	return time.Parse("2006-01-02", s)
}

func (h *InvoiceHandler) Create(c *gin.Context) {
	var createdBy *uuid.UUID
	if uidVal, ok := c.Get(middleware.CtxUserIDKey); ok {
		if uid, ok := uidVal.(uuid.UUID); ok {
			createdBy = &uid
		}
	}
	var body createInvoiceBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	issue, err := parseDate(body.IssueDate)
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "issue_date must be YYYY-MM-DD")
		return
	}
	due, err := parseDate(body.DueDate)
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "due_date must be YYYY-MM-DD")
		return
	}
	inv := models.Invoice{
		ClientID:   body.ClientID,
		ProjectID:  body.ProjectID,
		TrainingID: body.TrainingID,
		Amount:     body.Amount,
		Currency:   body.Currency,
		IssueDate:  issue,
		DueDate:    due,
		Notes:      body.Notes,
	}
	if err := h.svc.Create(&inv, createdBy); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	fresh, err := h.svc.GetByID(inv.ID)
	if err != nil {
		pkgutils.OK(c, http.StatusCreated, inv)
		return
	}
	pkgutils.OK(c, http.StatusCreated, fresh)
}

func (h *InvoiceHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	inv, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	pkgutils.OK(c, http.StatusOK, inv)
}

// PDF streams a branded invoice PDF (requires dashboard key or JWT).
func (h *InvoiceHandler) PDF(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	inv, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	data, err := h.svc.RenderPDF(inv)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, "pdf generation failed")
		return
	}
	base := safeInvoiceFile.ReplaceAllString(inv.InvoiceNumber, "_")
	if strings.Trim(base, "._-") == "" {
		base = id.String()
	}
	filename := base + ".pdf"
	disposition := "attachment"
	if c.Query("disposition") == "inline" || c.Query("preview") == "1" || strings.EqualFold(c.Query("preview"), "true") {
		disposition = "inline"
	}
	c.Header("Content-Disposition", disposition+`; filename="`+filename+`"`)
	c.Header("Cache-Control", "no-store")
	c.Data(http.StatusOK, "application/pdf", data)
}

func (h *InvoiceHandler) List(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	status := c.Query("status")
	clientID := c.Query("client_id")
	items, err := h.svc.List(limit, offset, status, clientID)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"items": items})
}

func (h *InvoiceHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var body createInvoiceBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	existing, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	issue, err := parseDate(body.IssueDate)
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "issue_date must be YYYY-MM-DD")
		return
	}
	due, err := parseDate(body.DueDate)
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "due_date must be YYYY-MM-DD")
		return
	}
	existing.ClientID = body.ClientID
	existing.ProjectID = body.ProjectID
	existing.TrainingID = body.TrainingID
	existing.Amount = body.Amount
	existing.Currency = body.Currency
	existing.IssueDate = issue
	existing.DueDate = due
	existing.Notes = body.Notes
	if err := h.svc.Update(existing); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	fresh, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.OK(c, http.StatusOK, existing)
		return
	}
	pkgutils.OK(c, http.StatusOK, fresh)
}

func (h *InvoiceHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.svc.Delete(id); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"deleted": true})
}
