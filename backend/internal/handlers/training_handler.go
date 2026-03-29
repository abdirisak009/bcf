package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type TrainingHandler struct {
	svc *services.TrainingService
}

func NewTrainingHandler(svc *services.TrainingService) *TrainingHandler {
	return &TrainingHandler{svc: svc}
}

func (h *TrainingHandler) List(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	items, err := h.svc.List(limit, offset)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"items": items})
}

func (h *TrainingHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	t, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	if t == nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	pkgutils.OK(c, http.StatusOK, t)
}

func (h *TrainingHandler) Create(c *gin.Context) {
	var req models.Training
	if err := c.ShouldBindJSON(&req); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	if err := h.svc.Create(&req); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusCreated, req)
}

func (h *TrainingHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var req models.Training
	if err := c.ShouldBindJSON(&req); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	existing, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	if existing == nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	existing.Title = strings.TrimSpace(req.Title)
	if existing.Title == "" {
		pkgutils.Fail(c, http.StatusBadRequest, "title is required")
		return
	}
	existing.Description = req.Description
	existing.Slug = req.Slug
	existing.AcademyID = req.AcademyID
	existing.Duration = req.Duration
	existing.Format = req.Format
	existing.Level = req.Level
	if len(req.Curriculum) > 0 {
		existing.Curriculum = append(json.RawMessage(nil), req.Curriculum...)
	} else {
		existing.Curriculum = nil
	}
	if len(req.Outcomes) > 0 {
		existing.Outcomes = append(json.RawMessage(nil), req.Outcomes...)
	} else {
		existing.Outcomes = nil
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

func (h *TrainingHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	t, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	if t == nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	if err := h.svc.Delete(id); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"deleted": true})
}
