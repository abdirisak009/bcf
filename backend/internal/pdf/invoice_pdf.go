package pdf

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/go-pdf/fpdf"

	"github.com/bararug/website-backend/internal/models"
)

// sanitizePDFText strips/replaces Unicode punctuation so Helvetica (Latin-1) renders correctly.
// Em/en dashes and smart quotes often show as "â€"" in PDFs if passed through unchanged.
func sanitizePDFText(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return s
	}
	// Mojibake: UTF-8 em dash bytes misinterpreted (often shows as â€" in broken viewers / bad imports)
	s = strings.ReplaceAll(s, "\u00e2\u20ac\u201d", "-")
	// Raw UTF-8 sequence for EM DASH (U+2014) when not decoded as a single rune
	s = strings.ReplaceAll(s, string([]byte{0xe2, 0x80, 0x94}), "-")
	repl := strings.NewReplacer(
		"\u2014", "-", // em dash
		"\u2013", "-", // en dash
		"\u2012", "-", // figure dash
		"\u201c", `"`, // "
		"\u201d", `"`, // "
		"\u2018", "'", // '
		"\u2019", "'", // '
		"\u2026", "...",
		"\u00a0", " ",
		"\ufeff", "",
	)
	s = repl.Replace(s)
	return s
}

// DefaultLogoURL matches public Home navigation logo (dark/colored on white).
const DefaultLogoURL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-hewaKh5CChoShCWQNvfbpnsVOGTuVh.png"

const (
	nR, nG, nB = 33, 73, 137
	tR, tG, tB = 85, 197, 147
	mR, mG, mB = 206, 244, 209
	// Default logo asset pixel ratio (navigation / Home PNG) for PDF height estimate.
	logoAssetWpx, logoAssetHpx = 180.0, 50.0
)

// RenderInvoice builds a minimalist PDF: header (wordmark left | INVOICE or RECEIPT VOUCHER right), Bill to / From, then lines.
// Title is RECEIPT VOUCHER when the invoice is fully settled (no balance due); otherwise INVOICE.
func RenderInvoice(inv *models.Invoice, paid float64, logoURL string, companyAddress string) ([]byte, error) {
	if logoURL == "" {
		logoURL = DefaultLogoURL
	}
	if strings.TrimSpace(companyAddress) == "" {
		companyAddress = "Mogadishu\nSomalia"
	}
	outstanding := inv.Amount - paid
	if outstanding < 0 {
		outstanding = 0
	}
	fullyPaid := outstanding <= 0.005 ||
		strings.EqualFold(strings.TrimSpace(inv.Status), models.InvoiceStatusPaid)
	docTitle := "INVOICE"
	titleFontPt := 22.0
	titleBlockW := 52.0
	if fullyPaid {
		docTitle = "RECEIPT VOUCHER"
		titleFontPt = 16.0
		titleBlockW = 88.0
	}

	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(18, 18, 18)
	pdf.SetAutoPageBreak(true, 26)
	pdf.AddPage()

	// --- Header: LEFT = wordmark logo (same asset as website Home) | RIGHT = INVOICE or RECEIPT VOUCHER ---
	yHeader := 14.0
	leftX := 18.0
	// Wide logo on the left (replaces former “Bararug Consulting” + tagline text).
	leftLogoW := 62.0
	leftLogoH := leftLogoW * logoAssetHpx / logoAssetWpx

	imgBytes, imgType, err := fetchImage(logoURL)
	imgOK := err == nil && len(imgBytes) > 0
	if imgOK {
		tp := strings.ToLower(imgType)
		if tp != "png" && tp != "jpeg" && tp != "jpg" {
			tp = "png"
		}
		opt := fpdf.ImageOptions{ImageType: tp, ReadDpi: true}
		pdf.RegisterImageOptionsReader("inv_logo", opt, bytes.NewReader(imgBytes))
		pdf.ImageOptions("inv_logo", leftX, yHeader, leftLogoW, 0, false, opt, 0, "")
	} else {
		leftLogoH = 14.0
		pdf.SetFillColor(tR, tG, tB)
		pdf.Rect(leftX, yHeader+1, leftLogoW, leftLogoH, "F")
		pdf.SetFont("Helvetica", "B", 10)
		pdf.SetTextColor(255, 255, 255)
		pdf.SetXY(leftX, yHeader+4.5)
		pdf.CellFormat(leftLogoW, 6, "Bararug", "", 0, "C", false, 0, "")
		pdf.SetTextColor(0, 0, 0)
	}

	pdf.SetFillColor(tR, tG, tB)
	pdf.Rect(leftX, yHeader+leftLogoH+1.2, leftLogoW*0.72, 1.0, "F")

	marginR := 18.0
	invoiceBlockW := titleBlockW
	invoiceX := 210.0 - marginR - invoiceBlockW
	pdf.SetFont("Helvetica", "B", titleFontPt)
	pdf.SetTextColor(0, 0, 0)
	pdf.SetXY(invoiceX, yHeader+2)
	pdf.CellFormat(invoiceBlockW, 12, docTitle, "", 0, "R", false, 0, "")

	invoiceRowBottom := yHeader + 2.0 + 12.0
	logoBlockBottom := yHeader + leftLogoH + 1.2 + 1.0
	lineY := logoBlockBottom
	if invoiceRowBottom > lineY {
		lineY = invoiceRowBottom
	}
	lineY += 3.0

	pdf.SetDrawColor(218, 224, 232)
	pdf.SetLineWidth(0.35)
	pdf.Line(18, lineY, 192, lineY)

	// --- Two columns: Bill to (left) | From / company (right), italic body like reference ---
	yAddr := lineY + 4.0
	colW := 82.0

	pdf.SetTextColor(0, 0, 0)
	pdf.SetXY(18, yAddr)
	pdf.SetFont("Helvetica", "B", 9)
	pdf.Cell(40, 5, "Bill to")
	pdf.SetXY(18, yAddr+6)
	pdf.SetFont("Helvetica", "B", 10)
	clientName := ""
	if inv.Client != nil {
		clientName = strings.TrimSpace(inv.Client.Name)
	}
	if clientName == "" {
		clientName = "Client"
	}
	pdf.MultiCell(colW, 5.2, sanitizePDFText(clientName), "", "L", false)
	yLeft := pdf.GetY()

	pdf.SetXY(110, yAddr)
	pdf.SetFont("Helvetica", "B", 9)
	pdf.Cell(74, 5, "From")
	yR := yAddr + 6.0
	pdf.SetFont("Helvetica", "I", 9)
	for _, line := range strings.Split(companyAddress, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		pdf.SetXY(110, yR)
		pdf.CellFormat(74, 5, line, "", 0, "R", false, 0, "")
		yR += 5
	}
	yRight := yR

	yNext := yLeft
	if yRight > yNext {
		yNext = yRight
	}
	if yNext < yAddr+18 {
		yNext = yAddr + 18
	}

	metaY := yNext + 6

	// --- Invoice meta (compact) ---
	pdf.SetDrawColor(nR, nG, nB)
	pdf.SetFillColor(mR, mG, mB)
	pdf.SetLineWidth(0.25)
	pdf.SetTextColor(nR, nG, nB)
	pdf.SetFont("Helvetica", "B", 9)
	pdf.Rect(18, metaY, 174, 22, "FD")

	pdf.SetXY(22, metaY+3)
	pdf.Cell(55, 5, "Invoice #")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(22, metaY+8)
	pdf.Cell(55, 6, inv.InvoiceNumber)

	pdf.SetFont("Helvetica", "B", 9)
	pdf.SetXY(92, metaY+3)
	pdf.Cell(40, 5, "Status")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(92, metaY+8)
	pdf.Cell(40, 6, humanizeStatus(inv.Status))

	issue := inv.IssueDate.Format("2006-01-02")
	due := inv.DueDate.Format("2006-01-02")
	pdf.SetFont("Helvetica", "B", 8)
	pdf.SetXY(140, metaY+3)
	pdf.Cell(48, 4, "Issue")
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(140, metaY+7)
	pdf.Cell(48, 4, issue)
	pdf.SetFont("Helvetica", "B", 8)
	pdf.SetXY(140, metaY+12)
	pdf.Cell(48, 4, "Due")
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(140, metaY+16)
	pdf.Cell(48, 4, due)

	pdf.SetY(metaY + 28)

	// Context line (training / project)
	if inv.Project != nil && strings.TrimSpace(inv.Project.Name) != "" {
		pdf.SetFont("Helvetica", "I", 9)
		pdf.SetTextColor(70, 90, 130)
		pdf.Cell(0, 6, sanitizePDFText("Project: "+inv.Project.Name))
		pdf.Ln(5)
		pdf.SetTextColor(nR, nG, nB)
	}
	if inv.Training != nil && strings.TrimSpace(inv.Training.Title) != "" {
		pdf.SetFont("Helvetica", "I", 9)
		pdf.SetTextColor(70, 90, 130)
		pdf.Cell(0, 6, sanitizePDFText("Training: "+inv.Training.Title))
		pdf.Ln(5)
		pdf.SetTextColor(nR, nG, nB)
	}

	pdf.Ln(4)

	// Line items
	pdf.SetFillColor(nR, nG, nB)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(112, 9, "  Description", "1", 0, "L", true, 0, "")
	pdf.CellFormat(62, 9, "Amount  ", "1", 1, "R", true, 0, "")

	pdf.SetTextColor(nR, nG, nB)
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetFillColor(255, 255, 255)
	desc := sanitizePDFText(lineItemDescription(inv))
	pdf.CellFormat(112, 10, "  "+desc, "LRB", 0, "L", false, 0, "")
	pdf.CellFormat(62, 10, fmt.Sprintf("%s %.2f", inv.Currency, inv.Amount), "LRB", 1, "R", false, 0, "")

	pdf.Ln(4)
	pdf.SetFont("Helvetica", "", 10)
	pdf.CellFormat(112, 7, "Amount paid", "", 0, "R", false, 0, "")
	pdf.CellFormat(62, 7, fmt.Sprintf("%.2f %s", paid, inv.Currency), "", 1, "R", false, 0, "")
	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(112, 8, "Balance due", "", 0, "R", false, 0, "")
	pdf.SetTextColor(180, 60, 60)
	pdf.CellFormat(62, 8, fmt.Sprintf("%.2f %s", outstanding, inv.Currency), "", 1, "R", false, 0, "")
	pdf.SetTextColor(nR, nG, nB)

	if inv.Notes != nil && strings.TrimSpace(*inv.Notes) != "" {
		pdf.Ln(6)
		pdf.SetFont("Helvetica", "B", 10)
		pdf.SetTextColor(nR, nG, nB)
		pdf.Cell(0, 6, "Notes")
		// Move below the title row (h=6); Ln(2) was too small and overlapped the body text.
		pdf.Ln(8)
		pdf.SetFont("Helvetica", "", 9)
		pdf.SetTextColor(70, 90, 130)
		pdf.MultiCell(0, 5, sanitizePDFText(strings.TrimSpace(*inv.Notes)), "", "L", false)
		pdf.SetTextColor(nR, nG, nB)
	}

	pdf.Ln(12)
	pdf.SetFont("Helvetica", "I", 8)
	pdf.SetTextColor(110, 110, 110)
	pdf.MultiCell(0, 4, "Thank you for your business.", "", "C", false)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func lineItemDescription(inv *models.Invoice) string {
	if inv.Training != nil && strings.TrimSpace(inv.Training.Title) != "" {
		return "Training: " + inv.Training.Title
	}
	if inv.Project != nil && strings.TrimSpace(inv.Project.Name) != "" {
		return "Project: " + inv.Project.Name
	}
	return "Professional services"
}

func humanizeStatus(s string) string {
	s = strings.TrimSpace(strings.ToLower(s))
	if s == "" {
		return "-"
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

func fetchImage(url string) ([]byte, string, error) {
	client := &http.Client{Timeout: 18 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("http %d", resp.StatusCode)
	}
	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", err
	}
	ct := resp.Header.Get("Content-Type")
	tp := "png"
	if strings.Contains(ct, "jpeg") || strings.Contains(ct, "jpg") {
		tp = "jpeg"
	}
	if len(b) > 2 && b[0] == 0xFF && b[1] == 0xD8 {
		tp = "jpeg"
	}
	return b, tp, nil
}
