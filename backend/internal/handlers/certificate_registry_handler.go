package handlers

import (
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type CertificateRegistryHandler struct {
	svc *services.CertificateRegistryService
}

func NewCertificateRegistryHandler(svc *services.CertificateRegistryService) *CertificateRegistryHandler {
	return &CertificateRegistryHandler{svc: svc}
}

type approveStudentBody struct {
	ApplicationID string `json:"application_id" binding:"required"`
	FromDate      string `json:"from_date" binding:"required"`
	ToDate        string `json:"to_date" binding:"required"`
}

// ApproveStudent persists a certificate with the next BCF-YYYY-NNNN (dashboard / service auth).
func (h *CertificateRegistryHandler) ApproveStudent(c *gin.Context) {
	var body approveStudentBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	cert, err := h.svc.ApproveStudent(services.ApproveStudentInput{
		ApplicationID: body.ApplicationID,
		FromDate:      body.FromDate,
		ToDate:        body.ToDate,
	})
	if err != nil {
		switch {
		case errors.Is(err, services.ErrApplicationNotFound):
			pkgutils.Fail(c, http.StatusNotFound, err.Error())
		case errors.Is(err, services.ErrApplicationNotApproved):
			pkgutils.Fail(c, http.StatusConflict, err.Error())
		default:
			pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		}
		return
	}
	pkgutils.OK(c, http.StatusCreated, services.ToCertificateDTO(cert))
}

// GetCertificate returns certificate metadata (public; possession of number is treated as sufficient for this flow).
func (h *CertificateRegistryHandler) GetCertificate(c *gin.Context) {
	no := strings.TrimSpace(c.Param("certificateNo"))
	if no == "" {
		pkgutils.Fail(c, http.StatusBadRequest, "certificate number required")
		return
	}
	data, err := h.svc.GetPublicMetadata(no)
	if err != nil {
		if errors.Is(err, services.ErrCertificateNotFound) {
			pkgutils.Fail(c, http.StatusNotFound, "certificate not found")
			return
		}
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, data)
}

// DownloadCertificate returns the filled PDF.
func (h *CertificateRegistryHandler) DownloadCertificate(c *gin.Context) {
	no := strings.TrimSpace(c.Param("certificateNo"))
	if no == "" {
		pkgutils.Fail(c, http.StatusBadRequest, "certificate number required")
		return
	}
	pdfBytes, filename, err := h.svc.RenderCertificatePDFByNumber(no)
	if err != nil {
		if errors.Is(err, services.ErrCertificateNotFound) {
			pkgutils.Fail(c, http.StatusNotFound, "certificate not found")
			return
		}
		log.Printf("certificate pdf: %v", err)
		pkgutils.Fail(c, http.StatusInternalServerError, "pdf generation failed")
		return
	}
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", `attachment; filename="`+filename+`"`)
	c.Header("Cache-Control", "no-store")
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}
