package config

import (
	"encoding/json"
	"fmt"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// BootstrapAdmin optional: server startup creates this user if email does not exist yet (bcrypt hash).
// Set BOOTSTRAP_ADMIN_1_EMAIL / BOOTSTRAP_ADMIN_1_PASSWORD (and _2_, _3_, … up to _5_).
type BootstrapAdmin struct {
	Email    string
	Password string
}

type Config struct {
	DBHost      string
	DBPort      string
	DBUser      string
	DBPass      string
	DBName      string
	JWTSecret   string
	JWTExpiry   time.Duration
	HTTPPort    string
	GinMode     string
	Environment string
	// DashboardWriteKey optional: if set, POST /api/news accepts X-Dashboard-Key with this value (for server-side dashboard writes).
	DashboardWriteKey string
	// DevUploadBypassKey optional: only when APP_ENV=development. If set, POST /api/upload accepts X-Dev-Upload-Bypass with this value (no JWT). Never set in production.
	DevUploadBypassKey string
	// InvoiceLogoURL optional: PNG/JPEG URL embedded on generated invoice PDFs (default: Bararug light wordmark).
	InvoiceLogoURL string
	// CertificateLogoURL optional: PNG/JPEG URL for vector certificate header.
	// Default when unset: {PUBLIC_SITE_URL or PUBLIC_WEB_URL}/logo.png (same file as the home page /public/logo.png), else INVOICE_LOGO_URL.
	CertificateLogoURL string
	// InvoiceCompanyAddress optional: multiline (\\n) sender block on the PDF header (right column).
	InvoiceCompanyAddress string
	// CertificateTemplateURL optional: PDF (Acrobat template, page 1 imported) or PNG/JPEG background for training certificates.
	CertificateTemplateURL    string
	CertificateSignatoryName  string
	CertificateSignatoryTitle string

	// WhatsApp / outbound notifications for new training applications (optional).
	// WHATSAPP_PROVIDER: webhook | callmebot | ultramsg (empty = disabled)
	WhatsAppProvider         string
	WhatsAppNotifyTo         string // admin recipient: digits with country code, e.g. 252613685943
	WhatsAppWebhookURL       string
	WhatsAppWebhookBearer    string // optional Authorization Bearer for webhook
	WhatsAppCallMeBotAPIKey  string
	WhatsAppUltramsgInstance string // Ultramsg instance id
	WhatsAppUltramsgToken    string
	PublicDashboardURL       string // e.g. https://yoursite.com/dashboard — shown in the message
	// PublicWebURL optional origin (legacy / fallback for certificate QR when PublicSiteURL is empty).
	PublicWebURL string
	// PublicSiteURL optional public **website** origin where Next.js runs (e.g. https://bararug.so). Used for QR links to /verify?no=.... No trailing slash.
	PublicSiteURL string
	// CertificateQRPublicURL optional: HTTPS origin for PDF QR codes only (overrides PUBLIC_SITE_URL for /verify links). Use when PUBLIC_SITE_URL is http://127.0.0.1 for templates but production site is https://yourdomain.so.
	CertificateQRPublicURL string

	// WhatsApp sendText API (e.g. WAHA / similar) — POST JSON with X-Api-Key; chatId = PHONE_DIGITS@c.us
	WhatsAppSendTextURL     string
	WhatsAppSendTextAPIKey  string
	WhatsAppSendTextSession string // default session name, e.g. "default"
	// WhatsApp sendFile URL (e.g. WAHA POST /api/sendFile). If empty, derived from WhatsAppSendTextURL by replacing sendText with sendFile.
	WhatsAppSendFileURL string

	// CORSAllowOrigins: comma-separated in CORS_ALLOW_ORIGINS (e.g. http://62.72.35.109,https://bcf.so) — merged with built-in dev origins.
	CORSAllowOrigins []string

	// BootstrapAdmins: optional; on startup, each pair is created as role=admin if that email is missing (password min 8 chars).
	BootstrapAdmins []BootstrapAdmin

	// Cloudinary — dashboard uploads (POST /api/upload). Optional until uploads are used.
	CloudinaryCloudName string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string
}

func Load() (*Config, error) {
	loadDotEnv()
	j := loadDeploymentJSON()

	minutes := 60 * 24
	if v := getenvWithJSON(j, "JWT_EXPIRY_MINUTES", ""); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			minutes = n
		}
	}

	invoiceLogo := getenvWithJSON(
		j,
		"INVOICE_LOGO_URL",
		"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-hewaKh5CChoShCWQNvfbpnsVOGTuVh.png",
	)
	publicSiteURL := strings.TrimRight(strings.TrimSpace(getenvWithJSON(j, "PUBLIC_SITE_URL", "")), "/")
	publicWebURL := strings.TrimRight(strings.TrimSpace(getenvWithJSON(j, "PUBLIC_WEB_URL", "")), "/")
	certQRPublicURL := strings.TrimRight(strings.TrimSpace(getenvWithJSON(j, "CERTIFICATE_QR_SITE_URL", "")), "/")

	certLogo := strings.TrimSpace(getenvWithJSON(j, "CERTIFICATE_LOGO_URL", ""))
	if certLogo == "" {
		siteBase := publicSiteURL
		if siteBase == "" {
			siteBase = publicWebURL
		}
		if siteBase != "" {
			certLogo = siteBase + "/logo.png"
		} else {
			certLogo = invoiceLogo
		}
	}

	return &Config{
		DBHost:             getenvWithJSON(j, "DB_HOST", "localhost"),
		DBPort:             getenvWithJSON(j, "DB_PORT", "5433"),
		DBUser:             getenvWithJSON(j, "DB_USER", "bcf"),
		DBPass:             getenvWithJSON(j, "DB_PASSWORD", ""),
		DBName:             getenvWithJSON(j, "DB_NAME", "BcfDb"),
		JWTSecret:          getenvWithJSON(j, "JWT_SECRET", "supersecretkey"),
		JWTExpiry:          time.Duration(minutes) * time.Minute,
		HTTPPort:           getenvWithJSON(j, "HTTP_PORT", "8080"),
		GinMode:            getenvWithJSON(j, "GIN_MODE", "release"),
		Environment:        getenvWithJSON(j, "APP_ENV", "development"),
		DashboardWriteKey:    getenvWithJSON(j, "DASHBOARD_WRITE_KEY", ""),
		DevUploadBypassKey:   getenvWithJSON(j, "DEV_UPLOAD_BYPASS_KEY", ""),
		InvoiceLogoURL:     invoiceLogo,
		CertificateLogoURL: certLogo,
		// Sender block under "From" (company name is already in the header left).
		InvoiceCompanyAddress: getenvWithJSON(
			j,
			"INVOICE_COMPANY_ADDRESS",
			"Mogadishu\nSomalia",
		),
		// Set to your Next.js public PDF, e.g. http://127.0.0.1:3000/Certificate-tem.pdf (form fields: StudentName, TrainingName, …).
		CertificateTemplateURL: getenvWithJSON(j, "CERTIFICATE_TEMPLATE_URL", ""),
		CertificateSignatoryName: getenvWithJSON(
			j,
			"CERTIFICATE_SIGNATORY_NAME",
			"Director",
		),
		CertificateSignatoryTitle: getenvWithJSON(
			j,
			"CERTIFICATE_SIGNATORY_TITLE",
			"Bararug Consulting",
		),
		WhatsAppProvider:         strings.ToLower(strings.TrimSpace(getenvWithJSON(j, "WHATSAPP_PROVIDER", ""))),
		WhatsAppNotifyTo:         getenvWithJSON(j, "WHATSAPP_NOTIFY_TO", ""),
		WhatsAppWebhookURL:       getenvWithJSON(j, "WHATSAPP_WEBHOOK_URL", ""),
		WhatsAppWebhookBearer:    getenvWithJSON(j, "WHATSAPP_WEBHOOK_BEARER", ""),
		WhatsAppCallMeBotAPIKey:  getenvWithJSON(j, "WHATSAPP_CALLMEBOT_APIKEY", ""),
		WhatsAppUltramsgInstance: getenvWithJSON(j, "WHATSAPP_ULTRAMSG_INSTANCE", ""),
		WhatsAppUltramsgToken:    getenvWithJSON(j, "WHATSAPP_ULTRAMSG_TOKEN", ""),
		PublicDashboardURL:       getenvWithJSON(j, "PUBLIC_DASHBOARD_URL", ""),
		PublicSiteURL:            publicSiteURL,
		PublicWebURL:             publicWebURL,
		CertificateQRPublicURL:   certQRPublicURL,
		WhatsAppSendTextURL:      getenvWithJSON(j, "WHATSAPP_SENDTEXT_URL", ""),
		WhatsAppSendTextAPIKey:   getenvWithJSON(j, "WHATSAPP_SENDTEXT_API_KEY", ""),
		WhatsAppSendTextSession:  getenvWithJSON(j, "WHATSAPP_SENDTEXT_SESSION", "default"),
		WhatsAppSendFileURL:      getenvWithJSON(j, "WHATSAPP_SENDFILE_URL", ""),
		CORSAllowOrigins:         splitCommaList(getenvWithJSON(j, "CORS_ALLOW_ORIGINS", "")),
		BootstrapAdmins:          loadBootstrapAdmins(j),
		CloudinaryCloudName: getenvWithJSON(j, "CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryAPIKey:    getenvWithJSON(j, "CLOUDINARY_API_KEY", ""),
		CloudinaryAPISecret: getenvWithJSON(j, "CLOUDINARY_API_SECRET", ""),
	}, nil
}

func getenv(k, def string) string {
	if v := strings.TrimSpace(os.Getenv(k)); v != "" {
		return v
	}
	return def
}

// getenvWithJSON returns os.Getenv(key) if set; else deployment.config.json backend[key]; else def.
func getenvWithJSON(j map[string]string, key, def string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	if j != nil {
		if v := strings.TrimSpace(j[key]); v != "" {
			return v
		}
	}
	return def
}

// loadDeploymentJSON reads repo-root deployment.config.json (optional). Set BCF_DEPLOYMENT_CONFIG to an absolute path to override.
func loadDeploymentJSON() map[string]string {
	paths := []string{
		strings.TrimSpace(os.Getenv("BCF_DEPLOYMENT_CONFIG")),
		"deployment.config.json",
		"../deployment.config.json",
		"../../deployment.config.json",
	}
	for _, p := range paths {
		if p == "" {
			continue
		}
		raw, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		var root struct {
			Backend map[string]string `json:"backend"`
		}
		if err := json.Unmarshal(raw, &root); err != nil || root.Backend == nil {
			continue
		}
		return root.Backend
	}
	return nil
}

func parseBoolEnv(s string) bool {
	s = strings.TrimSpace(strings.ToLower(s))
	return s == "1" || s == "true" || s == "yes"
}

// CloudinaryConfigured is true when all required Cloudinary env vars are set.
func (c *Config) CloudinaryConfigured() bool {
	if c == nil {
		return false
	}
	return strings.TrimSpace(c.CloudinaryCloudName) != "" &&
		strings.TrimSpace(c.CloudinaryAPIKey) != "" &&
		strings.TrimSpace(c.CloudinaryAPISecret) != ""
}

func splitCommaList(s string) []string {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	var out []string
	for _, p := range strings.Split(s, ",") {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

// loadBootstrapAdmins reads BOOTSTRAP_ADMIN_{1..5}_EMAIL and _PASSWORD (from env or deployment.config.json backend).
func loadBootstrapAdmins(j map[string]string) []BootstrapAdmin {
	var out []BootstrapAdmin
	for i := 1; i <= 5; i++ {
		ek := fmt.Sprintf("BOOTSTRAP_ADMIN_%d_EMAIL", i)
		pk := fmt.Sprintf("BOOTSTRAP_ADMIN_%d_PASSWORD", i)
		email := strings.ToLower(strings.TrimSpace(getenvWithJSON(j, ek, "")))
		// Trim so hashes match login/register (env files often have trailing newlines).
		pass := strings.TrimSpace(getenvWithJSON(j, pk, ""))
		if email == "" || pass == "" {
			continue
		}
		out = append(out, BootstrapAdmin{Email: email, Password: pass})
	}
	return out
}

// loadDotEnv finds .env whether you run from backend/ or backend/cmd/ (go run main.go).
func loadDotEnv() {
	for _, p := range []string{".env", "../.env", "../../.env"} {
		if _, err := os.Stat(p); err != nil {
			continue
		}
		_ = godotenv.Load(p)
		return
	}
}

// PostgresDSN builds a libpq-compatible URL (passwords with @ are safe via net/url).
func (c *Config) PostgresDSN() string {
	u := &url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(c.DBUser, c.DBPass),
		Host:   net.JoinHostPort(c.DBHost, c.DBPort),
		Path:   "/" + c.DBName,
	}
	q := url.Values{}
	q.Set("sslmode", "disable")
	q.Set("TimeZone", "UTC")
	u.RawQuery = q.Encode()
	return u.String()
}

func (c *Config) Validate() error {
	if c.JWTSecret == "" || len(c.JWTSecret) < 8 {
		return fmt.Errorf("JWT_SECRET must be at least 8 characters")
	}
	for _, b := range c.BootstrapAdmins {
		if len(b.Password) < 8 {
			return fmt.Errorf("BOOTSTRAP_ADMIN_* password for %q must be at least 8 characters", b.Email)
		}
	}
	return nil
}

// CertificateVerifyBaseURL is the public site origin for QR links to /verify (PUBLIC_SITE_URL, else PUBLIC_WEB_URL).
func (c *Config) CertificateVerifyBaseURL() string {
	if c == nil {
		return ""
	}
	s := strings.TrimRight(strings.TrimSpace(c.PublicSiteURL), "/")
	if s != "" {
		return s
	}
	return strings.TrimRight(strings.TrimSpace(c.PublicWebURL), "/")
}

// CertificateVerifyBaseURLForQR is used when building certificate PDFs: QR codes and verify links on the PDF.
// If CERTIFICATE_QR_SITE_URL is set, it is used (HTTPS live site) even when PUBLIC_SITE_URL is localhost for dev templates.
func (c *Config) CertificateVerifyBaseURLForQR() string {
	if c == nil {
		return ""
	}
	if s := strings.TrimRight(strings.TrimSpace(c.CertificateQRPublicURL), "/"); s != "" {
		return s
	}
	return c.CertificateVerifyBaseURL()
}

// ResolvePublicAssetURL joins PUBLIC_SITE_URL (or PUBLIC_WEB_URL) with a site path like /uploads/... so the
// API can HTTP-fetch assets stored by the Next.js public folder. Absolute http(s) URLs are unchanged.
func (c *Config) ResolvePublicAssetURL(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}
	lower := strings.ToLower(raw)
	if strings.HasPrefix(lower, "http://") || strings.HasPrefix(lower, "https://") {
		return raw
	}
	base := c.CertificateVerifyBaseURL()
	if base == "" {
		return raw
	}
	if strings.HasPrefix(raw, "/") {
		return base + raw
	}
	return base + "/" + raw
}
