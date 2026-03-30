package config

import (
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

	minutes := 60 * 24
	if v := os.Getenv("JWT_EXPIRY_MINUTES"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			minutes = n
		}
	}

	return &Config{
		DBHost:            getenv("DB_HOST", "localhost"),
		DBPort:            getenv("DB_PORT", "5433"),
		DBUser:            getenv("DB_USER", "bcf"),
		DBPass:            getenv("DB_PASSWORD", ""),
		DBName:            getenv("DB_NAME", "BcfDb"),
		JWTSecret:         getenv("JWT_SECRET", "supersecretkey"),
		JWTExpiry:         time.Duration(minutes) * time.Minute,
		HTTPPort:          getenv("HTTP_PORT", "8080"),
		GinMode:           getenv("GIN_MODE", "release"),
		Environment:       getenv("APP_ENV", "development"),
		DashboardWriteKey: getenv("DASHBOARD_WRITE_KEY", ""),
		// Same asset as public navigation (Home) — works on white PDF background.
		InvoiceLogoURL: getenv(
			"INVOICE_LOGO_URL",
			"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-hewaKh5CChoShCWQNvfbpnsVOGTuVh.png",
		),
		// Sender block under "From" (company name is already in the header left).
		InvoiceCompanyAddress: getenv(
			"INVOICE_COMPANY_ADDRESS",
			"Mogadishu\nSomalia",
		),
		// Set to your Next.js public PDF, e.g. http://127.0.0.1:3000/Certificate-tem.pdf (form fields: StudentName, TrainingName, …).
		CertificateTemplateURL: getenv("CERTIFICATE_TEMPLATE_URL", ""),
		CertificateSignatoryName: getenv(
			"CERTIFICATE_SIGNATORY_NAME",
			"Director",
		),
		CertificateSignatoryTitle: getenv(
			"CERTIFICATE_SIGNATORY_TITLE",
			"Bararug Consulting",
		),
		WhatsAppProvider:         strings.ToLower(strings.TrimSpace(getenv("WHATSAPP_PROVIDER", ""))),
		WhatsAppNotifyTo:         getenv("WHATSAPP_NOTIFY_TO", ""),
		WhatsAppWebhookURL:       getenv("WHATSAPP_WEBHOOK_URL", ""),
		WhatsAppWebhookBearer:    getenv("WHATSAPP_WEBHOOK_BEARER", ""),
		WhatsAppCallMeBotAPIKey:  getenv("WHATSAPP_CALLMEBOT_APIKEY", ""),
		WhatsAppUltramsgInstance: getenv("WHATSAPP_ULTRAMSG_INSTANCE", ""),
		WhatsAppUltramsgToken:    getenv("WHATSAPP_ULTRAMSG_TOKEN", ""),
		PublicDashboardURL:     getenv("PUBLIC_DASHBOARD_URL", ""),
		WhatsAppSendTextURL:    getenv("WHATSAPP_SENDTEXT_URL", ""),
		WhatsAppSendTextAPIKey: getenv("WHATSAPP_SENDTEXT_API_KEY", ""),
		WhatsAppSendTextSession: getenv("WHATSAPP_SENDTEXT_SESSION", "default"),
		CORSAllowOrigins:        splitCommaList(os.Getenv("CORS_ALLOW_ORIGINS")),
	}, nil
}

func getenv(k, def string) string {
	if v := strings.TrimSpace(os.Getenv(k)); v != "" {
		return v
	}
	return def
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
