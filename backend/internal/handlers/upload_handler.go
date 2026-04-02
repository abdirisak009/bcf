package handlers

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/middleware"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/permissions"
	"github.com/bararug/website-backend/internal/repositories"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
)

var errMinioNotConfigured = errors.New("minio not configured")

const (
	maxImageBytes = 8 * 1024 * 1024
	maxPDFBytes   = 25 * 1024 * 1024
	maxDocBytes   = 15 * 1024 * 1024
)

var imageExt = map[string]struct{}{
	".jpg": {}, ".jpeg": {}, ".png": {}, ".webp": {}, ".gif": {},
}

var publicationExt = map[string]struct{}{
	".jpg": {}, ".jpeg": {}, ".png": {}, ".webp": {}, ".gif": {},
	".pdf": {}, ".doc": {}, ".docx": {},
}

var mimeByExt = map[string]string{
	".jpg":  "image/jpeg",
	".jpeg": "image/jpeg",
	".png":  "image/png",
	".webp": "image/webp",
	".gif":  "image/gif",
	".pdf":  "application/pdf",
	".doc":  "application/msword",
	".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

// UploadHandler stores dashboard files in MinIO (same rules as Next.js lib/upload.ts).
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

func contentTypeForExt(ext string) string {
	if v, ok := mimeByExt[strings.ToLower(ext)]; ok {
		return v
	}
	return "application/octet-stream"
}

func publicFileURL(objectKey string) string {
	parts := strings.Split(objectKey, "/")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		out = append(out, url.PathEscape(p))
	}
	return "/files/" + strings.Join(out, "/")
}

func randomFilenamePart() string {
	b := make([]byte, 6)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)[:8]
}

func validateBlob(folder, ext string, size int64) (int, string) {
	ext = strings.ToLower(ext)
	if ext == "" {
		if folder == "news" || folder == "clients" || folder == "partners" || folder == "certificates" {
			ext = ".jpg"
		} else {
			ext = ".pdf"
		}
	}
	if folder == "news" || folder == "clients" || folder == "partners" || folder == "certificates" {
		if _, ok := imageExt[ext]; !ok {
			return http.StatusBadRequest, fmt.Sprintf("Image: allowed types: .jpg, .jpeg, .png, .webp, .gif")
		}
		if size > maxImageBytes {
			return http.StatusBadRequest, "File too large (max 8 MB)"
		}
		return 0, ext
	}
	if folder == "publications" || folder == "expenses" {
		if _, ok := publicationExt[ext]; !ok {
			return http.StatusBadRequest, "Allowed types: images, PDF, .doc, .docx"
		}
		var max int64
		switch ext {
		case ".pdf":
			max = maxPDFBytes
		case ".doc", ".docx":
			max = maxDocBytes
		default:
			max = maxImageBytes
		}
		if size > max {
			switch ext {
			case ".pdf":
				return http.StatusBadRequest, "PDF too large (max 25 MB)"
			case ".doc", ".docx":
				return http.StatusBadRequest, "Document too large (max 15 MB)"
			default:
				return http.StatusBadRequest, "Image too large (max 8 MB)"
			}
		}
		return 0, ext
	}
	return http.StatusBadRequest, "Invalid folder"
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

func (h *UploadHandler) minioClient() (*minio.Client, error) {
	if !h.cfg.MinIOConfigured() {
		return nil, errMinioNotConfigured
	}
	port, err := strconv.Atoi(strings.TrimSpace(h.cfg.MinioPort))
	if err != nil || port < 1 {
		return nil, fmt.Errorf("MINIO_PORT")
	}
	endpoint := fmt.Sprintf("%s:%d", strings.TrimSpace(h.cfg.MinioEndpoint), port)
	region := strings.TrimSpace(h.cfg.MinioRegion)
	return minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(h.cfg.MinioAccessKey, h.cfg.MinioSecretKey, ""),
		Secure: h.cfg.MinioUseSSL,
		Region: region,
	})
}

func ensureBucket(ctx context.Context, client *minio.Client, bucket, region string) error {
	ok, err := client.BucketExists(ctx, bucket)
	if err != nil {
		return err
	}
	if ok {
		return nil
	}
	opts := minio.MakeBucketOptions{}
	if region != "" {
		opts.Region = region
	}
	return client.MakeBucket(ctx, bucket, opts)
}

func (h *UploadHandler) Post(c *gin.Context) {
	if !h.cfg.MinIOConfigured() {
		pkgutils.Fail(c, http.StatusServiceUnavailable, "File upload is not configured on the API. Set MINIO_* environment variables on the Go server (same as Next.js).")
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
		pkgutils.Fail(c, http.StatusBadRequest, "Missing file")
		return
	}
	if fileHeader.Size <= 0 {
		pkgutils.Fail(c, http.StatusBadRequest, "Missing file")
		return
	}

	orig := fileHeader.Filename
	if strings.TrimSpace(orig) == "" {
		orig = "file"
	}
	ext := strings.ToLower(filepath.Ext(orig))

	status, msgOrExt := validateBlob(folderRaw, ext, fileHeader.Size)
	if status != 0 {
		pkgutils.Fail(c, status, msgOrExt)
		return
	}
	ext = msgOrExt

	f, err := fileHeader.Open()
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "Could not read file")
		return
	}
	defer f.Close()

	data, err := io.ReadAll(f)
	if err != nil {
		pkgutils.Fail(c, http.StatusBadRequest, "Could not read file")
		return
	}
	if int64(len(data)) != fileHeader.Size {
		pkgutils.Fail(c, http.StatusBadRequest, "Could not read file")
		return
	}

	sub := subdirForFolder(folderRaw)
	objectKey := fmt.Sprintf("%s/%d-%s%s", sub, time.Now().UnixMilli(), randomFilenamePart(), ext)
	ct := contentTypeForExt(ext)

	ctx := c.Request.Context()
	client, err := h.minioClient()
	if err != nil {
		if errors.Is(err, errMinioNotConfigured) {
			pkgutils.Fail(c, http.StatusServiceUnavailable, "MinIO is not configured")
			return
		}
		pkgutils.Fail(c, http.StatusInternalServerError, "storage client error")
		return
	}
	bucket := strings.TrimSpace(h.cfg.MinioBucket)
	if err := ensureBucket(ctx, client, bucket, strings.TrimSpace(h.cfg.MinioRegion)); err != nil {
		pkgutils.Fail(c, http.StatusBadGateway, "Could not access storage bucket")
		return
	}

	_, err = client.PutObject(ctx, bucket, objectKey, bytes.NewReader(data), int64(len(data)), minio.PutObjectOptions{
		ContentType: ct,
	})
	if err != nil {
		pkgutils.Fail(c, http.StatusBadGateway, "Upload failed. Check MinIO configuration.")
		return
	}

	pkgutils.OK(c, http.StatusOK, gin.H{"url": publicFileURL(objectKey)})
}
