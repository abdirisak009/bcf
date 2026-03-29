package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/middleware"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type PaymentHandler struct {
	svc *services.PaymentService
}

func NewPaymentHandler(svc *services.PaymentService) *PaymentHandler {
	return &PaymentHandler{svc: svc}
}

type createPaymentBody struct {
	AmountPaid      float64          `json:"amount_paid"`
	Amount          float64          `json:"amount"` // legacy alias
	Currency        string           `json:"currency"`
	Reference       *string          `json:"reference"`
	ReferenceNumber *string          `json:"reference_number"`
	PaymentType     string           `json:"payment_type" binding:"required"`
	PaymentMethod   string           `json:"payment_method"`
	PaymentDate     *time.Time       `json:"payment_date"`
	RelatedID       *uuid.UUID       `json:"related_id"`
	ClientID        *uuid.UUID       `json:"client_id"`
	InvoiceID       *uuid.UUID       `json:"invoice_id"`
	Metadata        *json.RawMessage `json:"metadata"`
}

func amountFromBody(b createPaymentBody) float64 {
	if b.AmountPaid != 0 {
		return b.AmountPaid
	}
	return b.Amount
}

func (h *PaymentHandler) Create(c *gin.Context) {
	var createdBy *uuid.UUID
	if uidVal, ok := c.Get(middleware.CtxUserIDKey); ok {
		if uid, ok := uidVal.(uuid.UUID); ok {
			createdBy = &uid
		}
	}
	var body createPaymentBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	amt := amountFromBody(body)
	if amt <= 0 {
		pkgutils.Fail(c, http.StatusBadRequest, "amount_paid (or amount) must be greater than 0")
		return
	}
	p := models.Payment{
		AmountPaid:      amt,
		Currency:        body.Currency,
		Reference:       body.Reference,
		ReferenceNumber: body.ReferenceNumber,
		PaymentType:     body.PaymentType,
		PaymentMethod:   body.PaymentMethod,
		RelatedID:       body.RelatedID,
		ClientID:        body.ClientID,
		InvoiceID:       body.InvoiceID,
	}
	if body.PaymentDate != nil {
		p.PaymentDate = *body.PaymentDate
	}
	if body.Metadata != nil {
		p.Metadata = *body.Metadata
	}
	if err := h.svc.Create(&p, createdBy); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusCreated, p)
}

func (h *PaymentHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	p, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	pkgutils.OK(c, http.StatusOK, p)
}

func (h *PaymentHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var body createPaymentBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	existing, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	amt := amountFromBody(body)
	if amt <= 0 {
		pkgutils.Fail(c, http.StatusBadRequest, "amount_paid (or amount) must be greater than 0")
		return
	}
	existing.AmountPaid = amt
	existing.Currency = body.Currency
	existing.Reference = body.Reference
	existing.ReferenceNumber = body.ReferenceNumber
	existing.PaymentType = body.PaymentType
	existing.PaymentMethod = body.PaymentMethod
	existing.RelatedID = body.RelatedID
	existing.ClientID = body.ClientID
	existing.InvoiceID = body.InvoiceID
	if body.PaymentDate != nil {
		existing.PaymentDate = *body.PaymentDate
	}
	if body.Metadata != nil {
		existing.Metadata = *body.Metadata
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
	pkgutils.OK(c, http.StatusOK, fresh)
}

func (h *PaymentHandler) Delete(c *gin.Context) {
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

func (h *PaymentHandler) List(c *gin.Context) {
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
