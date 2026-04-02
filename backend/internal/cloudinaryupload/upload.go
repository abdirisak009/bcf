// Package cloudinaryupload wraps the official Cloudinary Go SDK for dashboard uploads.
package cloudinaryupload

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"path"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var (
	// ErrNotConfigured is returned when SetClient was never called with a valid client.
	ErrNotConfigured = errors.New("cloudinary not configured")

	client *cloudinary.Cloudinary
)

// SetClient stores the Cloudinary client created at application startup.
func SetClient(c *cloudinary.Cloudinary) {
	client = c
}

// bytesMultipartFile wraps a byte slice as a multipart.File (for callers that already buffered the body).
type bytesMultipartFile struct{ r *bytes.Reader }

func (b *bytesMultipartFile) Read(p []byte) (int, error)         { return b.r.Read(p) }
func (b *bytesMultipartFile) ReadAt(p []byte, off int64) (int, error) { return b.r.ReadAt(p, off) }
func (b *bytesMultipartFile) Seek(offset int64, whence int) (int64, error) {
	return b.r.Seek(offset, whence)
}
func (b *bytesMultipartFile) Close() error { return nil }

// NewBytesMultipartFile adapts a buffer to multipart.File for UploadToCloudinary.
func NewBytesMultipartFile(data []byte) multipart.File {
	return &bytesMultipartFile{r: bytes.NewReader(data)}
}

// UploadToCloudinary uploads the file to Cloudinary under folder "uploads" (and optional subfolder
// encoded in filename as "subdir/name.ext"). resource_type is "auto". Returns the secure_url.
func UploadToCloudinary(file multipart.File, filename string) (string, error) {
	return UploadToCloudinaryContext(context.Background(), file, filename)
}

// UploadToCloudinaryContext is UploadToCloudinary with a caller-provided context (timeouts, cancellation).
func UploadToCloudinaryContext(ctx context.Context, file multipart.File, filename string) (string, error) {
	data, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("read upload: %w", err)
	}
	return uploadPayload(ctx, data, filename)
}

func uploadPayload(ctx context.Context, data []byte, filename string) (string, error) {
	if client == nil {
		return "", ErrNotConfigured
	}
	filename = strings.TrimSpace(filename)
	if filename == "" {
		return "", fmt.Errorf("empty filename")
	}

	rel := strings.Trim(filename, "/")
	dir := path.Dir(rel)
	base := path.Base(rel)
	stem := strings.TrimSuffix(base, strings.ToLower(path.Ext(base)))

	folder := "uploads"
	if dir != "." && dir != "" {
		folder = "uploads/" + dir
	}
	if stem == "" || stem == "." {
		return "", fmt.Errorf("invalid public id stem")
	}

	params := uploader.UploadParams{
		Folder:         folder,
		PublicID:       stem,
		ResourceType:   "auto",
		UniqueFilename: api.Bool(false),
	}

	result, err := client.Upload.Upload(ctx, bytes.NewReader(data), params)
	if err != nil {
		return "", err
	}
	if result.Error.Message != "" {
		return "", fmt.Errorf("cloudinary: %s", result.Error.Message)
	}
	url := strings.TrimSpace(result.SecureURL)
	if url == "" {
		url = strings.TrimSpace(result.URL)
	}
	if url == "" {
		return "", fmt.Errorf("cloudinary: empty secure_url in response")
	}
	return url, nil
}
