package pdf

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"

	qrcode "github.com/skip2/go-qrcode"
)

const certQROrganization = "Baraarug Consulting Firm"

type certQRPayload struct {
	Organization  string `json:"organization"`
	Participant   string `json:"participant"`
	Program       string `json:"program"`
	CertificateNo string `json:"certificate_no"`
	VerifyURL     string `json:"verify_url,omitempty"`
}

// certificateVerifyURL is the public website page that shows certificate details (Next.js /verify?no=...).
func certificateVerifyURL(d CertificateData) string {
	base := strings.TrimRight(strings.TrimSpace(d.VerifyPublicBaseURL), "/")
	no := strings.TrimSpace(d.CertificateNo)
	if base == "" || no == "" {
		return ""
	}
	return fmt.Sprintf("%s/verify?no=%s", base, url.QueryEscape(no))
}

func certificateQRPayloadJSON(d CertificateData) string {
	p := certQRPayload{
		Organization:  certQROrganization,
		Participant:   strings.TrimSpace(d.StudentName),
		Program:       strings.TrimSpace(d.TrainingName),
		CertificateNo: strings.TrimSpace(d.CertificateNo),
	}
	if u := certificateVerifyURL(d); u != "" {
		p.VerifyURL = u
	}
	b, err := json.Marshal(p)
	if err != nil {
		return fmt.Sprintf(`{"organization":%q,"participant":%q,"program":%q,"certificate_no":%q}`,
			certQROrganization, p.Participant, p.Program, p.CertificateNo)
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
