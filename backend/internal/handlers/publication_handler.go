package handlers

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/cloudinaryupload"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type PublicationHandler struct {
	svc *services.PublicationService
}

func NewPublicationHandler(svc *services.PublicationService) *PublicationHandler {
	return &PublicationHandler{svc: svc}
}

func (h *PublicationHandler) List(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	items, err := h.svc.List(limit, offset)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"items": items})
}

func (h *PublicationHandler) Get(c *gin.Context) {
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

func (h *PublicationHandler) Create(c *gin.Context) {
	var req models.Publication
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

func (h *PublicationHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var req models.Publication
	if err := c.ShouldBindJSON(&req); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	existing, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	existing.Title = strings.TrimSpace(req.Title)
	if existing.Title == "" {
		pkgutils.Fail(c, http.StatusBadRequest, "title is required")
		return
	}
	existing.Excerpt = req.Excerpt
	existing.Category = req.Category
	existing.CoverImageURL = req.CoverImageURL
	existing.FileURL = req.FileURL
	existing.FileDisplayMode = req.FileDisplayMode
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

func (h *PublicationHandler) Delete(c *gin.Context) {
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

// ServeFile streams the attached PDF for a publication directly from Cloudinary,
// using a signed download URL to bypass 401 errors caused by authenticated delivery.
// It sets Content-Disposition: inline so the PDF renders inside an iframe.
func (h *PublicationHandler) ServeFile(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	pub, err := h.svc.GetByID(id)
	if err != nil || pub == nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	if pub.FileURL == nil || strings.TrimSpace(*pub.FileURL) == "" {
		pkgutils.Fail(c, http.StatusNotFound, "no file attached")
		return
	}

	fileURL := strings.TrimSpace(*pub.FileURL)
	forceDownload := c.Query("download") == "1"

	// Generate a 1-hour signed Cloudinary URL (works even for authenticated delivery).
	signedURL, err := cloudinaryupload.GetSignedDownloadURL(c.Request.Context(), fileURL, time.Hour)
	if err != nil {
		log.Printf("[pub/file] cloudinary sign error for %s: %v", fileURL, err)
		// Fallback: redirect to raw URL (might still work if public)
		c.Redirect(http.StatusFound, fileURL)
		return
	}

	// Fetch the file from Cloudinary on behalf of the browser.
	req, err := http.NewRequestWithContext(c.Request.Context(), http.MethodGet, signedURL, nil)
	if err != nil {
		log.Printf("[pub/file] build request error: %v", err)
		pkgutils.Fail(c, http.StatusInternalServerError, "internal error")
		return
	}
	req.Header.Set("Accept", "application/pdf,application/octet-stream,*/*")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("[pub/file] upstream fetch error: %v", err)
		pkgutils.Fail(c, http.StatusBadGateway, "could not fetch file")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("[pub/file] upstream status %d for %s", resp.StatusCode, signedURL)
		pkgutils.Fail(c, http.StatusBadGateway, fmt.Sprintf("upstream returned %d", resp.StatusCode))
		return
	}

	disposition := "inline"
	if forceDownload {
		disposition = "attachment"
	}
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf(`%s; filename="publication.pdf"`, disposition))
	c.Header("Cache-Control", "private, max-age=3600")
	c.Header("X-Content-Type-Options", "nosniff")
	c.Status(http.StatusOK)
	_, _ = io.Copy(c.Writer, resp.Body)
}
