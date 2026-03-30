package pdf

import (
	"bytes"
	"strings"
)

// RegistryFillValues documents AcroForm names used in the Acrobat template (for authors editing Certificate-tem.pdf):
//   studentName, trainingName, fromDate, toDate, certificateNo, date, sigin
// The server no longer uses pdfcpu FillForm; fields are removed at render time and text is drawn via overlay.
type RegistryFillValues struct {
	StudentName    string
	TrainingName   string
	FromDate       string
	ToDate         string
	CertificateNo  string
	IssueDate      string
	SignatoryLine  string
}

// FillRegistryTemplate loads the PDF from templateURL, strips AcroForm widgets (removes grey field boxes),
// then draws dynamic text with gofpdf overlay (bold name, larger type).
func FillRegistryTemplate(templateURL string, overlay CertificateData) ([]byte, error) {
	templateURL = strings.TrimSpace(templateURL)
	if templateURL == "" {
		return RenderCertificate(overlay, "")
	}
	b, ct, err := fetchTemplateBytes(templateURL)
	if err != nil || len(b) == 0 {
		return RenderCertificate(overlay, "")
	}
	if !isPDFTemplate(b, ct, templateURL) {
		return RenderCertificate(overlay, templateURL)
	}

	stripped, err := stripFormFieldsFromPDF(b)
	if err != nil || len(stripped) == 0 {
		stripped = b
	}
	out, err := renderCertificatePDFOverlay(overlay, stripped)
	if err == nil {
		return out, nil
	}
	// pdfcpu form stripping sometimes rewrites xref in a way gofpdi cannot parse — retry raw template.
	if !bytes.Equal(stripped, b) {
		out2, err2 := renderCertificatePDFOverlay(overlay, b)
		if err2 == nil {
			return out2, nil
		}
	}
	// Last resort: full vector certificate (no AcroForm template).
	return RenderCertificate(overlay, "")
}

// CertificateDataFromRegistry maps DB certificate + config signatory into overlay data.
// verifyPublicBase is optional (PUBLIC_WEB_URL); embedded in QR JSON as verify_url when set.
// headerLogoURL is optional (CERTIFICATE_LOGO_URL / INVOICE_LOGO_URL) for vector certificate header branding.
func CertificateDataFromRegistry(studentName, trainingName, fromDisp, toDisp, certNo, issueDisp, signName, signTitle, verifyPublicBase, headerLogoURL string) CertificateData {
	return CertificateData{
		StudentName:         studentName,
		TrainingName:        trainingName,
		FromDate:            fromDisp,
		ToDate:              toDisp,
		CertificateNo:       certNo,
		IssueDate:           issueDisp,
		SignatoryName:       signName,
		SignatoryTitle:      signTitle,
		VerifyPublicBaseURL: strings.TrimSpace(verifyPublicBase),
		HeaderLogoURL:       strings.TrimSpace(headerLogoURL),
	}
}

// FillCertificateLikeRegistry runs the same template pipeline as issued certificates.
func FillCertificateLikeRegistry(templateURL string, d CertificateData) ([]byte, error) {
	return FillRegistryTemplate(templateURL, d)
}
