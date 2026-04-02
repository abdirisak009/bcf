package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/cloudinaryupload"
	"github.com/bararug/website-backend/internal/middleware"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/permissions"
	"github.com/bararug/website-backend/internal/repositories"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

const maxUploadBytes = 5 * 1024 * 1024

var allowedUploadExt = map[string]struct{}{
	".jpg": {}, ".jpeg": {}, ".png": {}, ".pdf": {},
}

// UploadHandler stores dashboard files in Cloudinary.
type UploadHandler struct {
	cfg      *config.Config
	authRepo *repositories.AuthRepository
}

func NewUploadHandler(cfg *config.Config, authRepo *repositories.AuthRepository) *UploadHandler {
	return &UploadHandler{cfg: cfg, authRepo: authRepo}
}

func uploadFolderPermission(folder string) string {
	switch folder {
	case "news":
		return permissions.News
	case "publications":
		return permissions.Publications
	case "clients":
		return permissions.Clients
	case "partners":
		return permissions.Partners
	case "expenses":
		return permissions.Expenses
	case "certificates":
		return permissions.Trainings
	default:
		return ""
	}
}

func parseFolder(raw string) string {
	switch strings.TrimSpace(strings.ToLower(raw)) {
	case "publications":
		return "publications"
	case "clients":
		return "clients"
	case "partners":
		return "partners"
	case "expenses":
		return "expenses"
	case "certificates":
		return "certificates"
	default:
		return "news"
	}
}

func subdirForFolder(folder string) string {
	switch folder {
	case "publications":
		return "publications"
	case "clients":
		return "clients"
	case "partners":
		return "partners"
	case "expenses":
		return "expenses"
	case "certificates":
		return "certificates"
	default:
		return "news"
	}
}

func randomFilenamePart() string {
	b := make([]byte, 6)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)[:8]
}

func validateUpload(ext string, size int64) (ok bool, msg string) {
	ext = strings.ToLower(ext)
	if ext == "" {
		return false, "File must have an extension (.jpg, .jpeg, .png, or .pdf)"
	}
	if _, ok := allowedUploadExt[ext]; !ok {
		return false, "Allowed types: .jpg, .jpeg, .png, .pdf"
	}
	if size <= 0 {
		return false, "Missing file"
	}
	if size > maxUploadBytes {
		return false, "File too large (max 5 MB)"
	}
	return true, ""
}

func (h *UploadHandler) Post(c *gin.Context) {
	if !h.cfg.CloudinaryConfigured() {
		pkgutils.Fail(c, http.StatusServiceUnavailable, "File upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.")
		return
	}

	roleVal, _ := c.Get(middleware.CtxRoleKey)
	role, _ := roleVal.(models.Role)

	folderRaw := parseFolder(c.PostForm("folder"))
	required := uploadFolderPermission(folderRaw)
	if required == "" {
		pkgutils.Fail(c, http.StatusBadRequest, "Invalid folder")
		return
	}

	if role != models.RoleAdmin {
		uidVal, ok := c.Get(middleware.CtxUserIDKey)
		if !ok {
			pkgutils.Fail(c, http.StatusForbidden, "forbidden")
			return
		}
		uid, ok := uidVal.(uuid.UUID)
		if !ok {
			pkgutils.Fail(c, http.StatusForbidden, "forbidden")
			return
		}
		perms, err := h.authRepo.GetPermissionKeys(uid)
		if err != nil {
			pkgutils.Fail(c, http.StatusInternalServerError, err.Error())
			return
		}
		if !middleware.UserHasDashboardPermission(role, perms, required) {
			pkgutils.Fail(c, http.StatusForbidden, "forbidden")
			return
		}
	}

	fileHeader, err := c.FormFile("file")
	if err != nil || fileHeader == nil {
		uploadFail(c, http.StatusBadRequest, "Missing file")
		return
	}
	if fileHeader.Size <= 0 {
		uploadFail(c, http.StatusBadRequest, "Missing file")
		return
	}

	orig := fileHeader.Filename
	if strings.TrimSpace(orig) == "" {
		orig = "file"
	}
	ext := strings.ToLower(filepath.Ext(orig))
	if ok, msg := validateUpload(ext, fileHeader.Size); !ok {
		uploadFail(c, http.StatusBadRequest, msg)
		return
	}

	f, err := fileHeader.Open()
	if err != nil {
		uploadFail(c, http.StatusBadRequest, "Could not read file")
		return
	}
	defer f.Close()

	limited := io.LimitReader(f, maxUploadBytes+1)
	data, err := io.ReadAll(limited)
	if err != nil {
		uploadFail(c, http.StatusBadRequest, "Could not read file")
		return
	}
	if int64(len(data)) > maxUploadBytes {
		uploadFail(c, http.StatusBadRequest, "File too large (max 5 MB)")
		return
	}
	if int64(len(data)) != fileHeader.Size {
		uploadFail(c, http.StatusBadRequest, "Could not read file")
		return
	}

	sub := subdirForFolder(folderRaw)
	objectName := fmt.Sprintf("%s/%d-%s%s", sub, time.Now().UnixMilli(), randomFilenamePart(), ext)

	ctx := c.Request.Context()
	url, err := cloudinaryupload.UploadToCloudinaryContext(ctx, cloudinaryupload.NewBytesMultipartFile(data), objectName)
	if err != nil {
		if errors.Is(err, cloudinaryupload.ErrNotConfigured) {
			uploadFail(c, http.StatusServiceUnavailable, "File upload is not configured.")
			return
		}
		log.Printf("upload: cloudinary error: %v", err)
		uploadFail(c, http.StatusBadGateway, "Upload failed. Try again later.")
		return
	}

	log.Printf("upload: success folder=%s bytes=%d", folderRaw, len(data))
	c.JSON(http.StatusOK, gin.H{"success": true, "url": url})
}

func uploadFail(c *gin.Context, status int, msg string) {
	log.Printf("upload: failed status=%d msg=%s", status, msg)
	c.JSON(status, gin.H{"success": false, "error": msg})
}
