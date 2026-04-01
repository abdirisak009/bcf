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
	// VerifyPublicBaseURL optional (PUBLIC_SITE_URL or PUBLIC_WEB_URL). QR encodes URL to /verify?no=... when set.
	VerifyPublicBaseURL string
	// HeaderLogoURL optional PNG/JPEG (same source as website wordmark). Fetched at render; fallback text if empty or fetch fails.
	HeaderLogoURL string
	// SignatorySignatureImageURL optional PNG/JPEG (absolute URL or resolved from site /uploads/...). Drawn on the signatory block when fetch succeeds.
	SignatorySignatureImageURL string
}

// RenderCertificate builds a landscape A4 PDF.
//   - If templateURL points to a PDF (e.g. /certificate-template.pdf), the file is imported with gofpdi
//     and dynamic fields are overlaid (use an Acrobat template with blank areas for these fields).
//   - If templateURL points to PNG/JPEG, the image is drawn full-bleed and the full text layout is drawn on top.
//   - If the URL is empty or fetch fails, a vector bordered layout with full text is used.
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
// gofpdi may panic on PDFs with xref streams or outputs from some tools; we recover and return an error.
func renderCertificatePDFOverlay(d CertificateData, pdfBytes []byte) (out []byte, err error) {
	defer func() {
		if r := recover(); r != nil {
			out = nil
			err = fmt.Errorf("pdf template import failed (gofpdi cannot read this PDF — re-export as PDF 1.4 from Acrobat, or use a simpler template): %v", r)
		}
	}()

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
	if e := pdf.Output(&buf); e != nil {
		return nil, e
	}
	return buf.Bytes(), nil
}

// Layout tuning for Certificate-tem.pdf (landscape A4). Adjust if the template changes.
const (
	certOverlayStudentYMM        = 64.0
	certOverlayStudentFontPt     = 26.0
	certOverlayStudentLineMM     = 11.0
	certOverlayCourseGapMM       = 7.0
	certOverlayCourseFontPt      = 16.0
	certOverlayCourseLineMM      = 8.0
	certOverlayPeriodGapMM       = 5.0
	certOverlayPeriodFontPt      = 11.0
	certOverlayFooterCertXMM     = 68.0
	certOverlayFooterCertYMM     = 178.0
	certOverlayFooterDateYMM     = 186.5
	certOverlayFooterValueFontPt = 11.0
	certOverlaySigYMM            = 166.0
	certOverlaySigBlockWMM       = 92.0
	certOverlaySigNameFontPt     = 11.0
	certOverlaySigTitleFontPt    = 10.0
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
	sigURL := strings.TrimSpace(d.SignatorySignatureImageURL)
	sigDrawn := false
	if sigURL != "" {
		if imgBytes, imgType, err := fetchImage(sigURL); err == nil && len(imgBytes) > 0 {
			tp := strings.ToLower(imgType)
			if tp != "png" && tp != "jpeg" && tp != "jpg" {
				if len(imgBytes) >= 2 && imgBytes[0] == 0xFF && imgBytes[1] == 0xD8 {
					tp = "jpeg"
				} else {
					tp = "png"
				}
			}
			opt := gofpdf.ImageOptions{ImageType: tp, ReadDpi: false}
			pdf.RegisterImageOptionsReader("certsigov", opt, bytes.NewReader(imgBytes))
			maxH := 14.0
			maxW := certOverlaySigBlockWMM
			imgY := lineY - 1 - maxH
			pdf.ImageOptions("certsigov", sigX, imgY, maxW, maxH, false, opt, 0, "")
			sigDrawn = true
		}
	}
	if !sigDrawn {
		pdf.SetDrawColor(nR, nG, nB)
		pdf.SetLineWidth(0.35)
		pdf.Line(sigX, lineY, pageW-18, lineY)
	}

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
	s = strings.TrimSpace(s)
	if s == "" {
		return s
	}
	// Mojibake: UTF-8 em dash mis-decoded (shows as â€" in some PDF viewers)
	s = strings.ReplaceAll(s, "\u00e2\u20ac\u201d", "-")
	s = strings.ReplaceAll(s, string([]byte{0xe2, 0x80, 0x94}), "-")
	s = strings.ReplaceAll(s, "\u2013", "-")
	s = strings.ReplaceAll(s, "\u2014", "-")
	s = strings.ReplaceAll(s, "\u2012", "-")
	s = strings.ReplaceAll(s, "\u2015", "-")
	// Common typo in programme titles
	s = strings.ReplaceAll(s, "Finanancial", "Financial")
	return s
}

func absInt(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

// balancedDescriptionTwoLines splits a sentence into two lines with similar length (avoids one word alone on line 2).
func balancedDescriptionTwoLines(text string) string {
	words := strings.Fields(strings.TrimSpace(text))
	if len(words) <= 2 {
		return text
	}
	bestSplit := 0
	bestScore := int(^uint(0) >> 1)
	for i := 0; i < len(words)-1; i++ {
		a := strings.Join(words[:i+1], " ")
		b := strings.Join(words[i+1:], " ")
		score := absInt(len(a) - len(b))
		if score < bestScore {
			bestScore = score
			bestSplit = i
		}
	}
	return strings.Join(words[:bestSplit+1], " ") + "\n" + strings.Join(words[bestSplit+1:], " ")
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

	drawCertificateLegacyTextOverlay(pdf, d, pageW)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func renderCertificateVector(d CertificateData) ([]byte, error) {
	pdf := fpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(0, 0, 0)
	pdf.SetAutoPageBreak(false, 0)
	pdf.AddPage()

	pageW, pageH := 297.0, 210.0
	pdf.SetFillColor(255, 255, 255)
	pdf.Rect(0, 0, pageW, pageH, "F")

	drawCertificateParticipationBararug(pdf, d, pageW, pageH)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// Certificate brand colors — match frontend app/globals.css (brand-navy, brand-teal / brand-green).
const (
	certBrandNavyR, certBrandNavyG, certBrandNavyB = 23, 94, 126   // #175e7e
	certBrandTealR, certBrandTealG, certBrandTealB = 85, 197, 147  // #55c593 — title + accents (site green)
	certRuleGreyR, certRuleGreyG, certRuleGreyB    = 211, 211, 211 // #D3D3D3 separator
)

// drawCertificateParticipationBararug — landscape layout inspired by professional participation certificates:
// Website logo + brand navy/teal; large green title; light footer band, signature / QR / date.
func drawCertificateParticipationBararug(pdf *fpdf.Fpdf, d CertificateData, pageW, pageH float64) {
	const (
		margin    = 14.0
		splitY    = 128.0
		footerBgR = 240
		footerBgG = 242
		footerBgB = 245
		labelBoxR = 228
		labelBoxG = 231
		labelBoxB = 235
		bodyTextR = 45
		bodyTextG = 52
		bodyTextB = 60
	)

	// Footer band + thick accent separator (same brand-teal as certificate title)
	pdf.SetFillColor(footerBgR, footerBgG, footerBgB)
	pdf.Rect(0, splitY, pageW, pageH-splitY, "F")
	pdf.SetFillColor(certBrandTealR, certBrandTealG, certBrandTealB)
	pdf.Rect(0, splitY-2.2, pageW, 2.2, "F")

	// Header: centered block — logo | vertical rule | large green title (brand-teal)
	const (
		headerTopY   = 11.0
		leftColW     = 76.0
		titleFontPt  = 24.0
		titleLineH   = 14.0
		ruleTop      = 9.0
		gapAfterLogo = 3.5
		gapAfterSep  = 5.0
		titlePadMM   = 4.0
	)
	pdf.SetFont("Helvetica", "B", titleFontPt)
	titleBlockW := pdf.GetStringWidth("CERTIFICATE OF")
	if w := pdf.GetStringWidth("PARTICIPATION"); w > titleBlockW {
		titleBlockW = w
	}
	titleBlockW += titlePadMM

	headerBlockW := leftColW + gapAfterLogo + gapAfterSep + titleBlockW
	blockStartX := (pageW - headerBlockW) / 2
	if blockStartX < margin {
		blockStartX = margin
	}
	logoX := blockStartX
	sepX := blockStartX + leftColW + gapAfterLogo
	titleX := sepX + gapAfterSep

	// Logo: same asset as home header (/public/logo.png via CERTIFICATE_LOGO_URL / PUBLIC_SITE_URL); scale similar to nav wordmark
	logoW := leftColW - 2.0
	logoH := logoW * logoAssetHpx / logoAssetWpx
	if logoH > 32.0 {
		logoH = 32.0
		logoW = logoH * logoAssetWpx / logoAssetHpx
	}

	logoURL := strings.TrimSpace(d.HeaderLogoURL)
	if logoURL == "" {
		logoURL = DefaultLogoURL
	}
	imgBytes, imgType, errLogo := fetchImage(logoURL)
	imgOK := errLogo == nil && len(imgBytes) > 0
	if imgOK {
		tp := strings.ToLower(imgType)
		if tp != "png" && tp != "jpeg" && tp != "jpg" {
			tp = "png"
		}
		opt := fpdf.ImageOptions{ImageType: tp, ReadDpi: true}
		pdf.RegisterImageOptionsReader("cert_hdr_logo", opt, bytes.NewReader(imgBytes))
		pdf.ImageOptions("cert_hdr_logo", logoX, headerTopY, logoW, logoH, false, opt, 0, "")
	} else {
		// Text fallback: same hierarchy as site — navy wordmark, teal tagline
		pdf.SetFont("Helvetica", "B", 19)
		pdf.SetTextColor(certBrandNavyR, certBrandNavyG, certBrandNavyB)
		pdf.SetXY(logoX, headerTopY+1)
		pdf.CellFormat(leftColW, 10, "Baraarug", "", 0, "L", false, 0, "")
		pdf.SetFont("Helvetica", "B", 9)
		pdf.SetTextColor(certBrandTealR, certBrandTealG, certBrandTealB)
		pdf.SetXY(logoX, headerTopY+12)
		pdf.CellFormat(leftColW, 6, "Consulting Firm", "", 0, "L", false, 0, "")
	}

	ruleBot := headerTopY + titleLineH*2 + 3.0
	if ruleBot < logoH+headerTopY+2 {
		ruleBot = logoH + headerTopY + 2
	}
	pdf.SetDrawColor(certRuleGreyR, certRuleGreyG, certRuleGreyB)
	pdf.SetLineWidth(0.35)
	pdf.Line(sepX, ruleTop, sepX, ruleBot)

	pdf.SetFont("Helvetica", "B", titleFontPt)
	pdf.SetTextColor(certBrandTealR, certBrandTealG, certBrandTealB)
	pdf.SetXY(titleX, headerTopY)
	pdf.CellFormat(titleBlockW, titleLineH, "CERTIFICATE OF", "", 0, "L", false, 0, "")
	pdf.SetXY(titleX, headerTopY+titleLineH)
	pdf.CellFormat(titleBlockW, titleLineH, "PARTICIPATION", "", 0, "L", false, 0, "")

	bodyW := pageW - 2*margin
	bodyStartY := ruleBot + 6.0

	// One row: grey label (left) + gap + large name (right), vertically aligned; whole row centered when it fits
	labelText := "This certificate is awarded to"
	labelH := 9.0
	gapLabelName := 4.0
	pdf.SetFont("Helvetica", "B", 8.5)
	labelW := pdf.GetStringWidth(labelText) + 12.0
	if labelW < 78.0 {
		labelW = 78.0
	}
	nameColW := bodyW - labelW - gapLabelName
	if nameColW < 32.0 {
		nameColW = 32.0
	}

	student := sanitizeCertText(strings.TrimSpace(d.StudentName))
	if student == "" {
		student = "Participant"
	}
	pdf.SetFont("Helvetica", "B", 23)
	nameWOne := pdf.GetStringWidth(student)
	rowW := labelW + gapLabelName + nameWOne
	if rowW > bodyW {
		rowW = labelW + gapLabelName + nameColW
	}
	rowX := margin + (bodyW-rowW)/2
	if rowX < margin {
		rowX = margin
	}

	pdf.SetFillColor(labelBoxR, labelBoxG, labelBoxB)
	pdf.Rect(rowX, bodyStartY, labelW, labelH, "F")
	pdf.SetFont("Helvetica", "B", 8.5)
	pdf.SetTextColor(bodyTextR, bodyTextG, bodyTextB)
	pdf.SetXY(rowX, bodyStartY+2.2)
	pdf.CellFormat(labelW, 5, labelText, "", 0, "C", false, 0, "")

	nameX := rowX + labelW + gapLabelName
	pdf.SetFont("Helvetica", "B", 23)
	pdf.SetTextColor(40, 45, 52)
	pdf.SetXY(nameX, bodyStartY+0.5)
	if nameWOne <= nameColW {
		pdf.CellFormat(nameColW, 11, student, "", 0, "L", false, 0, "")
	} else {
		pdf.MultiCell(nameColW, 11, student, "", "L", false)
	}
	rowBottom := bodyStartY + labelH
	if y := pdf.GetY(); y > rowBottom {
		rowBottom = y
	}

	training := sanitizeCertText(strings.TrimSpace(d.TrainingName))
	if training == "" {
		training = "Professional training"
	}
	// Extra space after name row; description block slightly inset for readability
	descInset := 12.0
	descW := bodyW - 2*descInset
	descX := margin + descInset
	descY := rowBottom + 9.0
	pdf.SetXY(descX, descY)
	pdf.SetFont("Helvetica", "", 13.5)
	pdf.SetTextColor(bodyTextR, bodyTextG, bodyTextB)
	pdf.MultiCell(descW, 7, "For attending the training on", "", "C", false)
	pdf.SetX(descX)
	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetTextColor(bodyTextR, bodyTextG, bodyTextB)
	// Single line when it fits — keeps title visually centered
	trainingW := pdf.GetStringWidth(training)
	if trainingW <= descW-1 {
		pdf.CellFormat(descW, 9.5, training, "", 1, "C", false, 0, "")
	} else {
		pdf.MultiCell(descW, 8.4, training, "", "C", false)
	}
	// Clear gap before workshop description (two balanced lines)
	pdf.SetY(pdf.GetY() + 5.5)
	pdf.SetX(descX)
	pdf.SetFont("Helvetica", "", 12.5)
	pdf.SetTextColor(bodyTextR, bodyTextG, bodyTextB)
	suffix := "A focused workshop on understanding, shaping, and strengthening organizational culture to enhance performance, collaboration, and employee engagement."
	descText := balancedDescriptionTwoLines(sanitizeCertText(suffix))
	pdf.MultiCell(descW, 6.8, descText, "", "C", false)

	pdf.SetFont("Helvetica", "", 10.5)
	pdf.SetTextColor(100, 108, 120)
	pdf.SetXY(0, pdf.GetY()+3)
	pdf.CellFormat(pageW, 6, "Certificate no. "+strings.TrimSpace(d.CertificateNo), "", 0, "C", false, 0, "")

	// Footer: signature (left), verification box (centre), dates (right)
	footY := splitY + 10
	sigX := margin
	sigW := 72.0
	lineYFoot := footY + 18
	sigURL := strings.TrimSpace(d.SignatorySignatureImageURL)
	sigDrawn := false
	if sigURL != "" {
		if imgBytes, imgType, err := fetchImage(sigURL); err == nil && len(imgBytes) > 0 {
			tp := strings.ToLower(imgType)
			if tp != "png" && tp != "jpeg" && tp != "jpg" {
				if len(imgBytes) >= 2 && imgBytes[0] == 0xFF && imgBytes[1] == 0xD8 {
					tp = "jpeg"
				} else {
					tp = "png"
				}
			}
			opt := fpdf.ImageOptions{ImageType: tp, ReadDpi: false}
			pdf.RegisterImageOptionsReader("certsigvec", opt, bytes.NewReader(imgBytes))
			maxH := 14.0
			pdf.ImageOptions("certsigvec", sigX, lineYFoot-1-maxH, sigW, maxH, false, opt, 0, "")
			sigDrawn = true
		}
	}
	pdf.SetDrawColor(60, 65, 75)
	pdf.SetLineWidth(0.3)
	if !sigDrawn {
		pdf.Line(sigX, lineYFoot, sigX+sigW, lineYFoot)
	}

	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetTextColor(certBrandNavyR, certBrandNavyG, certBrandNavyB)
	pdf.SetXY(sigX, footY+19)
	pdf.CellFormat(sigW, 5, strings.TrimSpace(d.SignatoryName), "", 0, "L", false, 0, "")

	pdf.SetFont("Helvetica", "", 8)
	pdf.SetTextColor(110, 118, 130)
	pdf.SetXY(sigX, footY+24.5)
	title := sanitizeCertText(strings.TrimSpace(d.SignatoryTitle))
	if title == "" {
		title = "Authorised signatory - Baraarug Consulting Firm"
	}
	pdf.MultiCell(sigW+4, 3.8, title, "", "L", false)

	// Centre: QR (JSON: org, participant, program, certificate_no, optional verify_url)
	box := 26.0
	cx := (pageW - box) / 2
	qrY := footY + 3
	if png, err := encodeCertificateQRPNG(d); err == nil && len(png) > 0 {
		opt := fpdf.ImageOptions{ImageType: "png", ReadDpi: false}
		pdf.RegisterImageOptionsReader("certqr", opt, bytes.NewReader(png))
		pdf.ImageOptions("certqr", cx, qrY, box, box, false, opt, 0, "")
	} else {
		pdf.SetDrawColor(190, 195, 202)
		pdf.SetLineWidth(0.25)
		pdf.Rect(cx, qrY, box, box, "D")
	}

	// Right: issue date + training period
	rightX := pageW - margin - 68
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetTextColor(certBrandNavyR, certBrandNavyG, certBrandNavyB)
	pdf.SetXY(rightX, footY+6)
	pdf.CellFormat(68, 5, formatCertDateSlashed(d.IssueDate), "", 0, "R", false, 0, "")
	pdf.SetFont("Helvetica", "", 8)
	pdf.SetTextColor(110, 118, 130)
	pdf.SetXY(rightX, footY+12)
	pdf.CellFormat(68, 4, "Training date", "", 0, "R", false, 0, "")

	if strings.TrimSpace(d.FromDate) != "" || strings.TrimSpace(d.ToDate) != "" {
		period := strings.TrimSpace(d.FromDate)
		if strings.TrimSpace(d.ToDate) != "" {
			if period != "" {
				period += "  –  " + strings.TrimSpace(d.ToDate)
			} else {
				period = strings.TrimSpace(d.ToDate)
			}
		}
		pdf.SetFont("Helvetica", "B", 9)
		pdf.SetTextColor(certBrandNavyR, certBrandNavyG, certBrandNavyB)
		pdf.SetXY(rightX, footY+22)
		pdf.CellFormat(68, 5, period, "", 0, "R", false, 0, "")
		pdf.SetFont("Helvetica", "", 8)
		pdf.SetTextColor(110, 118, 130)
		pdf.SetXY(rightX, footY+28)
		pdf.CellFormat(68, 4, "Training period", "", 0, "R", false, 0, "")
	}
}

func formatCertDateSlashed(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return ""
	}
	layouts := []string{
		"2006-01-02",
		"Jan 2, 2006",
		"January 2, 2006",
		"2 Jan 2006",
		"02 Jan 2006",
		time.RFC3339,
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, s); err == nil {
			return t.UTC().Format("02 / Jan / 2006")
		}
	}
	if t, err := time.Parse("2006-01-02T15:04:05Z07:00", s); err == nil {
		return t.UTC().Format("02 / Jan / 2006")
	}
	return s
}

// drawCertificateLegacyTextOverlay — simple centred overlay when a raster/PDF template is used as background.
func drawCertificateLegacyTextOverlay(pdf *fpdf.Fpdf, d CertificateData, pageW float64) {
	nR, nG, nB := 33, 73, 137
	pdf.SetTextColor(nR, nG, nB)

	pdf.SetFont("Helvetica", "B", 11)
	pdf.SetY(28)
	pdf.CellFormat(pageW, 8, "Baraarug Consulting Firm", "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(90, 100, 120)
	pdf.CellFormat(pageW, 5, "Policy · Governance · Growth", "", 1, "C", false, 0, "")
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
	sigW := 78.0
	centerX := (pageW - sigW) / 2
	lineY := sigY + 5
	sigURL := strings.TrimSpace(d.SignatorySignatureImageURL)
	sigDrawn := false
	if sigURL != "" {
		if imgBytes, imgType, err := fetchImage(sigURL); err == nil && len(imgBytes) > 0 {
			tp := strings.ToLower(imgType)
			if tp != "png" && tp != "jpeg" && tp != "jpg" {
				if len(imgBytes) >= 2 && imgBytes[0] == 0xFF && imgBytes[1] == 0xD8 {
					tp = "jpeg"
				} else {
					tp = "png"
				}
			}
			opt := fpdf.ImageOptions{ImageType: tp, ReadDpi: false}
			pdf.RegisterImageOptionsReader("certsigleg", opt, bytes.NewReader(imgBytes))
			maxH := 14.0
			pdf.ImageOptions("certsigleg", centerX, lineY-1-maxH, sigW, maxH, false, opt, 0, "")
			sigDrawn = true
		}
	}
	if !sigDrawn {
		pdf.SetDrawColor(80, 90, 105)
		pdf.SetLineWidth(0.3)
		pdf.Line(centerX, lineY, centerX+sigW, lineY)
	}
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
