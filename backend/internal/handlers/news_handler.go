package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/services"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

type NewsHandler struct {
	svc *services.NewsService
}

func NewNewsHandler(svc *services.NewsService) *NewsHandler {
	return &NewsHandler{svc: svc}
}

type newsCreateBody struct {
	Title            string     `json:"title" binding:"required"`
	Excerpt          *string    `json:"excerpt"`
	Body             *string    `json:"body"`
	CategoryID       *uuid.UUID `json:"category_id"`
	Category         *string    `json:"category"`
	FeaturedImageURL *string    `json:"featured_image_url"`
	GalleryURLs      []string   `json:"gallery_urls"`
	PublishedAt      *time.Time `json:"published_at"`
}

func (h *NewsHandler) List(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	items, err := h.svc.List(limit, offset)
	if err != nil {
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	out := make([]gin.H, 0, len(items))
	for i := range items {
		out = append(out, newsToPublic(&items[i]))
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"items": out})
}

func (h *NewsHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	n, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	pkgutils.OK(c, http.StatusOK, newsToPublic(n))
}

func (h *NewsHandler) Create(c *gin.Context) {
	var body newsCreateBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	n := &models.News{
		Title:            strings.TrimSpace(body.Title),
		Excerpt:          body.Excerpt,
		Body:             body.Body,
		Category:         body.Category,
		CategoryID:       body.CategoryID,
		FeaturedImageURL: body.FeaturedImageURL,
		PublishedAt:      body.PublishedAt,
	}
	if err := h.svc.SetGalleryURLs(n, body.GalleryURLs); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.svc.Create(n); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	// Reload with category for response
	fresh, err := h.svc.GetByID(n.ID)
	if err != nil {
		pkgutils.OK(c, http.StatusCreated, newsToPublic(n))
		return
	}
	pkgutils.OK(c, http.StatusCreated, newsToPublic(fresh))
}

func (h *NewsHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var body newsCreateBody
	if err := c.ShouldBindJSON(&body); err != nil {
		pkgutils.FailValidation(c, err)
		return
	}
	existing, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.Fail(c, http.StatusNotFound, "not found")
		return
	}
	existing.Title = strings.TrimSpace(body.Title)
	if existing.Title == "" {
		pkgutils.Fail(c, http.StatusBadRequest, "title is required")
		return
	}
	existing.Excerpt = body.Excerpt
	existing.Body = body.Body
	existing.Category = body.Category
	existing.CategoryID = body.CategoryID
	existing.PublishedAt = body.PublishedAt
	if body.FeaturedImageURL != nil {
		v := strings.TrimSpace(*body.FeaturedImageURL)
		if v == "" {
			existing.FeaturedImageURL = nil
		} else {
			existing.FeaturedImageURL = &v
		}
	}
	if body.GalleryURLs != nil {
		if err := h.svc.SetGalleryURLs(existing, body.GalleryURLs); err != nil {
			pkgutils.Fail(c, http.StatusBadRequest, err.Error())
			return
		}
	}
	if err := h.svc.Update(existing); err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	fresh, err := h.svc.GetByID(id)
	if err != nil {
		pkgutils.OK(c, http.StatusOK, newsToPublic(existing))
		return
	}
	pkgutils.OK(c, http.StatusOK, newsToPublic(fresh))
}

func (h *NewsHandler) Delete(c *gin.Context) {
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
		pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	pkgutils.OK(c, http.StatusOK, gin.H{"deleted": true})
}

func newsToPublic(n *models.News) gin.H {
	gallery := parseGalleryURLs(n.GalleryURLs)
	cat := categoryLabel(n)
	h := gin.H{
		"id":          n.ID.String(),
		"title":       n.Title,
		"excerpt":     n.Excerpt,
		"body":        n.Body,
		"category":    cat,
		"gallery_urls": gallery,
		"published_at": n.PublishedAt,
		"created_at":   n.CreatedAt,
		"updated_at":   n.UpdatedAt,
	}
	if n.CategoryID != nil {
		h["category_id"] = n.CategoryID.String()
	}
	if n.FeaturedImageURL != nil && *n.FeaturedImageURL != "" {
		h["featured_image_url"] = *n.FeaturedImageURL
	}
	return h
}

func categoryLabel(n *models.News) string {
	if n.CategoryRef != nil && strings.TrimSpace(n.CategoryRef.Name) != "" {
		return strings.TrimSpace(n.CategoryRef.Name)
	}
	if n.Category != nil && strings.TrimSpace(*n.Category) != "" {
		return strings.TrimSpace(*n.Category)
	}
	return "News"
}

func parseGalleryURLs(j []byte) []string {
	if len(j) == 0 {
		return []string{}
	}
	var urls []string
	if err := json.Unmarshal(j, &urls); err != nil {
		return []string{}
	}
	return urls
}
