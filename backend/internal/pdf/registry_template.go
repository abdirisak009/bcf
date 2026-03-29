package pdf

import (
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
	return renderCertificatePDFOverlay(overlay, stripped)
}

// CertificateDataFromRegistry maps DB certificate + config signatory into overlay data.
func CertificateDataFromRegistry(studentName, trainingName, fromDisp, toDisp, certNo, issueDisp, signName, signTitle string) CertificateData {
	return CertificateData{
		StudentName:    studentName,
		TrainingName:   trainingName,
		FromDate:       fromDisp,
		ToDate:         toDisp,
		CertificateNo:  certNo,
		IssueDate:      issueDisp,
		SignatoryName:  signName,
		SignatoryTitle: signTitle,
	}
}

// FillCertificateLikeRegistry runs the same template pipeline as issued certificates.
func FillCertificateLikeRegistry(templateURL string, d CertificateData) ([]byte, error) {
	return FillRegistryTemplate(templateURL, d)
}
