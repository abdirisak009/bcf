package pdf

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/go-pdf/fpdf"
	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
	"github.com/phpdave11/gofpdf"
	"github.com/phpdave11/gofpdf/contrib/gofpdi"
)

// CertificateData holds dynamic fields for the completion certificate PDF.
type CertificateData struct {
	StudentName    string
	TrainingName   string
	FromDate       string // display e.g. Jan 2, 2026
	ToDate         string
	CertificateNo  string
	IssueDate      string
	SignatoryName  string
	SignatoryTitle string
}

// RenderCertificate builds a landscape A4 PDF.
// - If templateURL points to a PDF (e.g. /certificate-template.pdf), the file is imported with gofpdi
//   and dynamic fields are overlaid (use an Acrobat template with blank areas for these fields).
// - If templateURL points to PNG/JPEG, the image is drawn full-bleed and the full text layout is drawn on top.
// - If the URL is empty or fetch fails, a vector bordered layout with full text is used.
func RenderCertificate(d CertificateData, templateURL string) ([]byte, error) {
	templateURL = strings.TrimSpace(templateURL)
	if templateURL == "" {
		return renderCertificateVector(d)
	}
	b, ct, err := fetchTemplateBytes(templateURL)
	if err != nil || len(b) == 0 {
		return renderCertificateVector(d)
	}
	if isPDFTemplate(b, ct, templateURL) {
		stripped, err := stripFormFieldsFromPDF(b)
		if err != nil || len(stripped) == 0 {
			stripped = b
		}
		return renderCertificatePDFOverlay(d, stripped)
	}
	return renderCertificateRasterBackground(d, b, ct)
}

func fetchTemplateBytes(rawURL string) ([]byte, string, error) {
	client := &http.Client{Timeout: 18 * time.Second}
	resp, err := client.Get(rawURL)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("http %d", resp.StatusCode)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", err
	}
	return body, resp.Header.Get("Content-Type"), nil
}

func isPDFTemplate(b []byte, contentType, urlStr string) bool {
	if len(b) >= 5 && string(b[:5]) == "%PDF-" {
		return true
	}
	ct := strings.ToLower(contentType)
	if strings.Contains(ct, "application/pdf") {
		return true
	}
	u := strings.ToLower(strings.TrimSpace(urlStr))
	return strings.HasSuffix(u, ".pdf")
}

// stripFormFieldsFromPDF removes AcroForm field widgets so grey highlight boxes are not printed.
// If removal fails, callers should fall back to the original bytes.
func stripFormFieldsFromPDF(pdfBytes []byte) ([]byte, error) {
	rs := bytes.NewReader(pdfBytes)
	var out bytes.Buffer
	conf := model.NewDefaultConfiguration()
	// nil field list => remove all form fields (pdfcpu form package).
	if err := api.RemoveFormFields(rs, &out, nil, conf); err != nil {
		return nil, err
	}
	if out.Len() == 0 {
		return nil, fmt.Errorf("empty pdf after strip")
	}
	return out.Bytes(), nil
}

// renderCertificatePDFOverlay imports an Acrobat PDF (page 1) and draws only dynamic text.
// Tune certOverlay* constants if your template uses different placeholder positions.
func renderCertificatePDFOverlay(d CertificateData, pdfBytes []byte) ([]byte, error) {
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(18, 18, 18)
	pdf.SetAutoPageBreak(false, 0)

	rs := io.ReadSeeker(bytes.NewReader(pdfBytes))
	imp := gofpdi.NewImporter()
	tplID := imp.ImportPageFromStream(pdf, &rs, 1, "/MediaBox")
	pdf.AddPage()
	pageW, pageH := 297.0, 210.0
	imp.UseImportedTemplate(pdf, tplID, 0, 0, pageW, pageH)

	drawCertificateDynamicOverlayGofpdf(pdf, d, pageW)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// Layout tuning for Certificate-tem.pdf (landscape A4). Adjust if the template changes.
const (
	certOverlayStudentYMM       = 64.0
	certOverlayStudentFontPt    = 26.0
	certOverlayStudentLineMM    = 11.0
	certOverlayCourseGapMM      = 7.0
	certOverlayCourseFontPt     = 16.0
	certOverlayCourseLineMM     = 8.0
	certOverlayPeriodGapMM      = 5.0
	certOverlayPeriodFontPt     = 11.0
	certOverlayFooterCertXMM    = 68.0
	certOverlayFooterCertYMM    = 178.0
	certOverlayFooterDateYMM    = 186.5
	certOverlayFooterValueFontPt = 11.0
	certOverlaySigYMM           = 166.0
	certOverlaySigBlockWMM      = 92.0
	certOverlaySigNameFontPt    = 11.0
	certOverlaySigTitleFontPt   = 10.0
)

func drawCertificateDynamicOverlayGofpdf(pdf *gofpdf.Fpdf, d CertificateData, pageW float64) {
	nR, nG, nB := 33, 73, 137
	mutedR, mutedG, mutedB := 70, 80, 95
	student := sanitizeCertText(strings.TrimSpace(d.StudentName))
	course := sanitizeCertText(strings.TrimSpace(d.TrainingName))

	pdf.SetTextColor(nR, nG, nB)

	pdf.SetFont("Helvetica", "B", certOverlayStudentFontPt)
	pdf.SetY(certOverlayStudentYMM)
	pdf.MultiCell(0, certOverlayStudentLineMM, student, "", "C", false)

	pdf.SetFont("Helvetica", "B", certOverlayCourseFontPt)
	pdf.SetY(pdf.GetY() + certOverlayCourseGapMM)
	pdf.MultiCell(0, certOverlayCourseLineMM, course, "", "C", false)

	if strings.TrimSpace(d.FromDate) != "" || strings.TrimSpace(d.ToDate) != "" {
		pdf.SetFont("Helvetica", "B", certOverlayPeriodFontPt)
		pdf.SetTextColor(mutedR, mutedG, mutedB)
		period := strings.TrimSpace(d.FromDate)
		if strings.TrimSpace(d.ToDate) != "" {
			if period != "" {
				period += "   –   " + strings.TrimSpace(d.ToDate)
			} else {
				period = strings.TrimSpace(d.ToDate)
			}
		}
		pdf.SetY(pdf.GetY() + certOverlayPeriodGapMM)
		pdf.CellFormat(pageW, 7, period, "", 1, "C", false, 0, "")
		pdf.SetTextColor(nR, nG, nB)
	}

	// Values only: template already prints "Certificate ID:" / "Date:" labels.
	pdf.SetFont("Helvetica", "B", certOverlayFooterValueFontPt)
	pdf.SetXY(certOverlayFooterCertXMM, certOverlayFooterCertYMM)
	pdf.CellFormat(120, 6, strings.TrimSpace(d.CertificateNo), "", 0, "L", false, 0, "")
	pdf.SetXY(certOverlayFooterCertXMM, certOverlayFooterDateYMM)
	pdf.CellFormat(120, 6, strings.TrimSpace(d.IssueDate), "", 0, "L", false, 0, "")

	// Bottom-right signature block (above "BCF Chairperson" line on template).
	sigX := pageW - 18 - certOverlaySigBlockWMM
	lineY := certOverlaySigYMM
	pdf.SetDrawColor(nR, nG, nB)
	pdf.SetLineWidth(0.35)
	pdf.Line(sigX, lineY, pageW-18, lineY)

	pdf.SetFont("Helvetica", "B", certOverlaySigNameFontPt)
	pdf.SetTextColor(nR, nG, nB)
	pdf.SetXY(sigX, lineY+2)
	pdf.CellFormat(certOverlaySigBlockWMM, 5, strings.TrimSpace(d.SignatoryName), "", 0, "R", false, 0, "")

	pdf.SetFont("Helvetica", "", certOverlaySigTitleFontPt)
	pdf.SetTextColor(mutedR, mutedG, mutedB)
	pdf.SetXY(sigX, lineY+7)
	pdf.CellFormat(certOverlaySigBlockWMM, 5, strings.TrimSpace(d.SignatoryTitle), "", 0, "R", false, 0, "")
}

func sanitizeCertText(s string) string {
	s = strings.ReplaceAll(s, "\u2013", "-")
	s = strings.ReplaceAll(s, "\u2014", "-")
	s = strings.ReplaceAll(s, "\u2012", "-")
	return s
}

func renderCertificateRasterBackground(d CertificateData, imgBytes []byte, contentType string) ([]byte, error) {
	pdf := fpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(18, 18, 18)
	pdf.SetAutoPageBreak(false, 0)
	pdf.AddPage()

	pageW, pageH := 297.0, 210.0
	tp := strings.ToLower(contentType)
	if !strings.Contains(tp, "png") && !strings.Contains(tp, "jpeg") && !strings.Contains(tp, "jpg") {
		if len(imgBytes) > 2 && imgBytes[0] == 0xFF && imgBytes[1] == 0xD8 {
			tp = "jpeg"
		} else {
			tp = "png"
		}
	}
	if tp != "png" && tp != "jpeg" && tp != "jpg" {
		tp = "png"
	}
	opt := fpdf.ImageOptions{ImageType: tp, ReadDpi: false}
	pdf.RegisterImageOptionsReader("certbg", opt, bytes.NewReader(imgBytes))
	pdf.ImageOptions("certbg", 0, 0, pageW, pageH, false, opt, 0, "")

	drawCertificateFullTextFpdf(pdf, d, pageW)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func renderCertificateVector(d CertificateData) ([]byte, error) {
	pdf := fpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(18, 18, 18)
	pdf.SetAutoPageBreak(false, 0)
	pdf.AddPage()

	pageW, pageH := 297.0, 210.0
	nR, nG, nB := 33, 73, 137
	tR, tG, tB := 85, 197, 147

	pdf.SetFillColor(255, 255, 255)
	pdf.Rect(0, 0, pageW, pageH, "F")
	pdf.SetDrawColor(nR, nG, nB)
	pdf.SetLineWidth(0.8)
	pdf.Rect(12, 12, pageW-24, pageH-24, "D")
	pdf.SetDrawColor(tR, tG, tB)
	pdf.SetLineWidth(0.5)
	pdf.Rect(16, 16, pageW-32, pageH-32, "D")

	drawCertificateFullTextFpdf(pdf, d, pageW)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func drawCertificateFullTextFpdf(pdf *fpdf.Fpdf, d CertificateData, pageW float64) {
	nR, nG, nB := 33, 73, 137
	pdf.SetTextColor(nR, nG, nB)

	pdf.SetFont("Helvetica", "B", 11)
	pdf.SetY(28)
	pdf.CellFormat(pageW, 8, "BARARUG CONSULTING", "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(90, 100, 120)
	pdf.CellFormat(pageW, 5, "Policy - Governance - Growth", "", 1, "C", false, 0, "")
	pdf.SetTextColor(nR, nG, nB)

	pdf.SetFont("Helvetica", "B", 22)
	pdf.SetY(52)
	pdf.CellFormat(pageW, 12, "Certificate of Completion", "", 1, "C", false, 0, "")

	pdf.SetFont("Helvetica", "", 11)
	pdf.SetTextColor(70, 80, 95)
	pdf.CellFormat(pageW, 7, "This is to certify that", "", 1, "C", false, 0, "")
	pdf.SetTextColor(nR, nG, nB)

	pdf.SetFont("Helvetica", "B", 20)
	pdf.SetY(pdf.GetY() + 4)
	pdf.MultiCell(0, 10, sanitizeCertText(strings.TrimSpace(d.StudentName)), "", "C", false)

	pdf.SetFont("Helvetica", "", 11)
	pdf.SetTextColor(70, 80, 95)
	pdf.SetY(pdf.GetY() + 2)
	pdf.CellFormat(pageW, 7, "has successfully completed", "", 1, "C", false, 0, "")
	pdf.SetTextColor(nR, nG, nB)

	pdf.SetFont("Helvetica", "B", 14)
	pdf.SetY(pdf.GetY() + 2)
	pdf.MultiCell(0, 8, sanitizeCertText(strings.TrimSpace(d.TrainingName)), "", "C", false)

	if strings.TrimSpace(d.FromDate) != "" || strings.TrimSpace(d.ToDate) != "" {
		pdf.SetFont("Helvetica", "", 10)
		period := strings.TrimSpace(d.FromDate)
		if strings.TrimSpace(d.ToDate) != "" {
			if period != "" {
				period += "  -  " + strings.TrimSpace(d.ToDate)
			} else {
				period = strings.TrimSpace(d.ToDate)
			}
		}
		pdf.SetY(pdf.GetY() + 4)
		pdf.CellFormat(pageW, 6, period, "", 1, "C", false, 0, "")
	}

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetY(138)
	pdf.SetTextColor(60, 70, 90)
	pdf.CellFormat(pageW/2-20, 6, "Certificate no.", "", 0, "R", false, 0, "")
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetTextColor(nR, nG, nB)
	pdf.CellFormat(pageW/2+20, 6, strings.TrimSpace(d.CertificateNo), "", 1, "L", false, 0, "")

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(60, 70, 90)
	pdf.CellFormat(pageW/2-20, 6, "Date issued", "", 0, "R", false, 0, "")
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetTextColor(nR, nG, nB)
	pdf.CellFormat(pageW/2+20, 6, strings.TrimSpace(d.IssueDate), "", 1, "L", false, 0, "")

	sigY := 168.0
	pdf.SetY(sigY)
	sigW := 78.0
	pdf.SetX((pageW - sigW) / 2)
	pdf.SetFont("Helvetica", "I", 9)
	pdf.SetTextColor(80, 90, 105)
	lineY := sigY + 5
	pdf.Line((pageW-sigW)/2, lineY, (pageW+sigW)/2, lineY)
	pdf.SetY(sigY + 8)
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetTextColor(nR, nG, nB)
	pdf.CellFormat(pageW, 5, strings.TrimSpace(d.SignatoryName), "", 1, "C", false, 0, "")
	pdf.SetFont("Helvetica", "", 9)
	pdf.CellFormat(pageW, 4, strings.TrimSpace(d.SignatoryTitle), "", 1, "C", false, 0, "")
}

// FormatDisplayDate parses YYYY-MM-DD to a short display form; returns input if parse fails.
func FormatDisplayDate(iso string) string {
	iso = strings.TrimSpace(iso)
	if iso == "" {
		return ""
	}
	t, err := time.Parse("2006-01-02", iso)
	if err != nil {
		return iso
	}
	return t.Format("Jan 2, 2006")
}
