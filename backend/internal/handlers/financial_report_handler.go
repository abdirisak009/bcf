package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type FinancialReportHandler struct {
	svc *services.FinancialReportService
}

func NewFinancialReportHandler(svc *services.FinancialReportService) *FinancialReportHandler {
	return &FinancialReportHandler{svc: svc}
}

func (h *FinancialReportHandler) Summary(c *gin.Context) {
	fromStr := c.Query("from")
	toStr := c.Query("to")
	from, to, err := services.ParseReportDates(fromStr, toStr)
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	out, err := h.svc.Summary(from, to)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, out)
}
