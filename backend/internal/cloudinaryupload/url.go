package cloudinaryupload

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"strconv"
	"strings"
	"time"
)

// GetSignedDownloadURL generates a time-limited Cloudinary private-download URL by calling
// the Cloudinary Admin API (POST /v1_1/{cloud}/{resource_type}/private_download_url).
//
// This works regardless of whether the asset's delivery type is "upload" or "authenticated",
// because the Admin API signs the request using API key + secret (Basic-auth equivalent).
//
// expiresIn: how long the resulting URL stays valid.
func GetSignedDownloadURL(ctx context.Context, fileURL string, expiresIn time.Duration) (string, error) {
	if client == nil {
		return "", ErrNotConfigured
	}

	resourceType, publicID, format, err := parseCloudinaryURL(fileURL)
	if err != nil {
		return "", err
	}

	cloudName := client.Config.Cloud.CloudName
	apiKey := client.Config.Cloud.APIKey
	apiSecret := client.Config.Cloud.APISecret

	now := time.Now().Unix()
	expiresAt := time.Now().Add(expiresIn).Unix()

	// Build sorted parameter string for SHA-1 signing (excludes api_key and signature).
	paramStr := fmt.Sprintf(
		"expires_at=%d&format=%s&public_id=%s&timestamp=%d&type=upload",
		expiresAt, format, publicID, now,
	)
	h := sha1.New()
	h.Write([]byte(paramStr + apiSecret))
	sig := hex.EncodeToString(h.Sum(nil))

	apiEndpoint := fmt.Sprintf(
		"https://api.cloudinary.com/v1_1/%s/%s/private_download_url",
		cloudName, resourceType,
	)

	form := url.Values{}
	form.Set("public_id", publicID)
	form.Set("format", format)
	form.Set("type", "upload")
	form.Set("expires_at", strconv.FormatInt(expiresAt, 10))
	form.Set("timestamp", strconv.FormatInt(now, 10))
	form.Set("api_key", apiKey)
	form.Set("signature", sig)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, apiEndpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return "", fmt.Errorf("cloudinary sign request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("cloudinary sign fetch: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		URL   string `json:"download_url"`
		Error struct {
			Message string `json:"message"`
		} `json:"error"`
	}
	if jsonErr := json.Unmarshal(body, &result); jsonErr != nil {
		return "", fmt.Errorf("cloudinary sign parse (status %d): %w", resp.StatusCode, jsonErr)
	}
	if result.Error.Message != "" {
		return "", fmt.Errorf("cloudinary sign error: %s", result.Error.Message)
	}
	if result.URL == "" {
		return "", fmt.Errorf("cloudinary sign: empty download_url in response (status %d)", resp.StatusCode)
	}
	return result.URL, nil
}

// parseCloudinaryURL extracts resourceType, publicID, and format from a Cloudinary delivery URL.
// Example: https://res.cloudinary.com/cloud/image/upload/v123/uploads/pub/file.pdf
//
//	→ resourceType="image", publicID="uploads/pub/file", format="pdf"
func parseCloudinaryURL(fileURL string) (resourceType, publicID, format string, err error) {
	u, parseErr := url.Parse(strings.TrimSpace(fileURL))
	if parseErr != nil {
		return "", "", "", fmt.Errorf("invalid URL: %w", parseErr)
	}
	if u.Scheme == "http" {
		u.Scheme = "https"
	}
	if !strings.HasSuffix(strings.ToLower(u.Hostname()), "cloudinary.com") {
		return "", "", "", fmt.Errorf("not a Cloudinary URL: %s", u.Hostname())
	}

	// Path: /{resource_type}/upload[/v{version}]/{public_id}.{ext}
	trimmed := strings.TrimPrefix(u.Path, "/")
	parts := strings.SplitN(trimmed, "/", 3)
	if len(parts) < 3 {
		return "", "", "", fmt.Errorf("unexpected Cloudinary path: %s", u.Path)
	}
	resourceType = parts[0] // "image" | "raw" | "video"
	// parts[1] == "upload"
	rest := parts[2]

	// Strip optional version prefix (vNNNNNN/)
	if idx := strings.Index(rest, "/"); idx > 1 && rest[0] == 'v' {
		allDigits := true
		for _, c := range rest[1:idx] {
			if c < '0' || c > '9' {
				allDigits = false
				break
			}
		}
		if allDigits {
			rest = rest[idx+1:]
		}
	}

	// rest = "folder/filename.ext"
	ext := path.Ext(rest)
	format = strings.TrimPrefix(strings.ToLower(ext), ".")
	publicID = strings.TrimSuffix(rest, ext)
	return resourceType, publicID, format, nil
}
