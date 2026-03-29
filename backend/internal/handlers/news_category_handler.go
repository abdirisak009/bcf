package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type NewsCategoryHandler struct {
	svc *services.NewsCategoryService
}

func NewNewsCategoryHandler(svc *services.NewsCategoryService) *NewsCategoryHandler {
	return &NewsCategoryHandler{svc: svc}
}

func (h *NewsCategoryHandler) List(c *gin.Context) {
	items, err := h.svc.List()
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"items": items})
}

func (h *NewsCategoryHandler) Create(c *gin.Context) {
	var req models.NewsCategory
	if err := c.ShouldBindJSON(&req); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	if err := h.svc.Create(&req); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusCreated, req)
}
