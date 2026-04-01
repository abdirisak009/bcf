package pdf

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"

	qrcode "github.com/skip2/go-qrcode"
)

const certQROrganization = "Baraarug Consulting Firm"

// certQRPayload is ordered with participant first so phone QR readers show the person's name immediately.
type certQRPayload struct {
	Participant   string `json:"participant"`
	CertificateNo string `json:"certificate_no"`
	Program       string `json:"program"`
	Organization  string `json:"organization"`
	VerifyURL     string `json:"verify_url,omitempty"`
	Note          string `json:"note,omitempty"`
}

// verifyBaseUnusableForMobileQR is true for localhost / loopback — scanners on phones cannot open those URLs.
func verifyBaseUnusableForMobileQR(base string) bool {
	base = strings.TrimSpace(base)
	if base == "" {
		return true
	}
	bl := strings.ToLower(base)
	if strings.Contains(bl, "127.0.0.1") || strings.Contains(bl, "localhost") || strings.Contains(bl, "[::1]") {
		return true
	}
	u, err := url.Parse(base)
	if err != nil || u.Hostname() == "" {
		return true
	}
	h := strings.ToLower(u.Hostname())
	if h == "localhost" || h == "127.0.0.1" || h == "::1" {
		return true
	}
	return false
}

// certificateVerifyURL is the public website page that shows certificate details (Next.js /verify?no=...).
// Returns empty when PUBLIC_SITE_URL is missing or is localhost (use JSON payload in the QR instead).
func certificateVerifyURL(d CertificateData) string {
	base := strings.TrimRight(strings.TrimSpace(d.VerifyPublicBaseURL), "/")
	no := strings.TrimSpace(d.CertificateNo)
	if verifyBaseUnusableForMobileQR(base) || no == "" {
		return ""
	}
	return fmt.Sprintf("%s/verify?no=%s", base, url.QueryEscape(no))
}

func certificateQRPayloadJSON(d CertificateData) string {
	participant := strings.TrimSpace(d.StudentName)
	program := strings.TrimSpace(d.TrainingName)
	certNo := strings.TrimSpace(d.CertificateNo)
	p := certQRPayload{
		Participant:   participant,
		CertificateNo: certNo,
		Program:       program,
		Organization:  certQROrganization,
	}
	if u := certificateVerifyURL(d); u != "" {
		p.VerifyURL = u
	} else {
		p.Note = "Add CERTIFICATE_QR_SITE_URL or PUBLIC_SITE_URL (https://yourdomain) on the server to open the verify page in a browser."
	}
	b, err := json.Marshal(p)
	if err != nil {
		return fmt.Sprintf(`{"participant":%q,"certificate_no":%q,"program":%q,"organization":%q}`,
			participant, certNo, program, certQROrganization)
	}
	return string(b)
}

func encodeCertificateQRPNG(d CertificateData) ([]byte, error) {
	// Prefer a compact URL so scanning opens the verify page in the browser.
	if u := certificateVerifyURL(d); u != "" {
		qr, err := qrcode.New(u, qrcode.Medium)
		if err == nil {
			return qr.PNG(256)
		}
	}
	payload := certificateQRPayloadJSON(d)
	qr, err := qrcode.New(payload, qrcode.Medium)
	if err != nil {
		d2 := d
		d2.VerifyPublicBaseURL = ""
		payload = certificateQRPayloadJSON(d2)
		qr, err = qrcode.New(payload, qrcode.Medium)
	}
	if err != nil {
		return nil, err
	}
	return qr.PNG(256)
}
