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

type Config struct {
	DBHost            string
	DBPort            string
	DBUser            string
	DBPass            string
	DBName            string
	JWTSecret         string
	JWTExpiry         time.Duration
	HTTPPort          string
	GinMode           string
	Environment       string
	// DashboardWriteKey optional: if set, POST /api/news accepts X-Dashboard-Key with this value (for server-side dashboard writes).
	DashboardWriteKey string
	// InvoiceLogoURL optional: PNG/JPEG URL embedded on generated invoice PDFs (default: Bararug light wordmark).
	InvoiceLogoURL string
	// InvoiceCompanyAddress optional: multiline (\\n) sender block on the PDF header (right column).
	InvoiceCompanyAddress string
	// CertificateTemplateURL optional: PDF (Acrobat template, page 1 imported) or PNG/JPEG background for training certificates.
	CertificateTemplateURL string
	CertificateSignatoryName string
	CertificateSignatoryTitle  string

	// WhatsApp / outbound notifications for new training applications (optional).
	// WHATSAPP_PROVIDER: webhook | callmebot | ultramsg (empty = disabled)
	WhatsAppProvider          string
	WhatsAppNotifyTo          string // admin recipient: digits with country code, e.g. 252613685943
	WhatsAppWebhookURL        string
	WhatsAppWebhookBearer     string // optional Authorization Bearer for webhook
	WhatsAppCallMeBotAPIKey   string
	WhatsAppUltramsgInstance  string // Ultramsg instance id
	WhatsAppUltramsgToken     string
	PublicDashboardURL        string // e.g. https://yoursite.com/dashboard — shown in the message

	// WhatsApp sendText API (e.g. WAHA / similar) — POST JSON with X-Api-Key; chatId = PHONE_DIGITS@c.us
	WhatsAppSendTextURL     string
	WhatsAppSendTextAPIKey  string
	WhatsAppSendTextSession string // default session name, e.g. "default"

	// CORSAllowOrigins: comma-separated in CORS_ALLOW_ORIGINS (e.g. http://62.72.35.109,https://bcf.so) — merged with built-in dev origins.
	CORSAllowOrigins []string
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

	return &Config{
		DBHost:            getenvWithJSON(j, "DB_HOST", "localhost"),
		DBPort:            getenvWithJSON(j, "DB_PORT", "5433"),
		DBUser:            getenvWithJSON(j, "DB_USER", "bcf"),
		DBPass:            getenvWithJSON(j, "DB_PASSWORD", ""),
		DBName:            getenvWithJSON(j, "DB_NAME", "BcfDb"),
		JWTSecret:         getenvWithJSON(j, "JWT_SECRET", "supersecretkey"),
		JWTExpiry:         time.Duration(minutes) * time.Minute,
		HTTPPort:          getenvWithJSON(j, "HTTP_PORT", "8080"),
		GinMode:           getenvWithJSON(j, "GIN_MODE", "release"),
		Environment:       getenvWithJSON(j, "APP_ENV", "development"),
		DashboardWriteKey: getenvWithJSON(j, "DASHBOARD_WRITE_KEY", ""),
		// Same asset as public navigation (Home) — works on white PDF background.
		InvoiceLogoURL: getenvWithJSON(
			j,
			"INVOICE_LOGO_URL",
			"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-hewaKh5CChoShCWQNvfbpnsVOGTuVh.png",
		),
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
		PublicDashboardURL:     getenvWithJSON(j, "PUBLIC_DASHBOARD_URL", ""),
		WhatsAppSendTextURL:    getenvWithJSON(j, "WHATSAPP_SENDTEXT_URL", ""),
		WhatsAppSendTextAPIKey: getenvWithJSON(j, "WHATSAPP_SENDTEXT_API_KEY", ""),
		WhatsAppSendTextSession: getenvWithJSON(j, "WHATSAPP_SENDTEXT_SESSION", "default"),
		CORSAllowOrigins:        splitCommaList(getenvWithJSON(j, "CORS_ALLOW_ORIGINS", "")),
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
	return nil
}
