package services

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/pdf"
	"github.com/bararug/website-backend/internal/repositories"
)

var (
	ErrApplicationNotApproved = errors.New("application is not approved")
	ErrApplicationNotFound    = errors.New("application not found")
	ErrCertificateNotFound      = repositories.ErrCertificateNotFound

	// Ephemeral certificate numbers from phone-based PDF issue (not stored in certificates table).
	reEphemeralFreeCert = regexp.MustCompile(`(?i)^BCF-(\d{4})-FT-([0-9A-F]{8})$`)
	reEphemeralPaidCert = regexp.MustCompile(`(?i)^BCF-(\d{4})-([0-9A-F]{8})$`)
)

type CertificateRegistryService struct {
	certRepo      *repositories.CertificateRepository
	appRepo       *repositories.ApplicationRepository
	freeTrainRepo *repositories.FreeTrainingRepository
	cfg           *config.Config
}

func NewCertificateRegistryService(
	certRepo *repositories.CertificateRepository,
	appRepo *repositories.ApplicationRepository,
	freeTrainRepo *repositories.FreeTrainingRepository,
	cfg *config.Config,
) *CertificateRegistryService {
	return &CertificateRegistryService{certRepo: certRepo, appRepo: appRepo, freeTrainRepo: freeTrainRepo, cfg: cfg}
}

type ApproveStudentInput struct {
	ApplicationID string
	FromDate      string // YYYY-MM-DD
	ToDate        string // YYYY-MM-DD
}

// ApproveStudent creates a certificate row with the next BCF-YYYY-NNNN number for an approved application.
func (s *CertificateRegistryService) ApproveStudent(in ApproveStudentInput) (*models.Certificate, error) {
	aid, err := uuid.Parse(strings.TrimSpace(in.ApplicationID))
	if err != nil {
		return nil, errors.New("invalid application_id")
	}
	fromD, err := time.Parse("2006-01-02", strings.TrimSpace(in.FromDate))
	if err != nil {
		return nil, errors.New("from_date must be YYYY-MM-DD")
	}
	toD, err := time.Parse("2006-01-02", strings.TrimSpace(in.ToDate))
	if err != nil {
		return nil, errors.New("to_date must be YYYY-MM-DD")
	}

	app, err := s.appRepo.GetByID(aid)
	if err != nil {
		return nil, ErrApplicationNotFound
	}
	if !strings.EqualFold(strings.TrimSpace(app.Status), "approved") {
		return nil, ErrApplicationNotApproved
	}
	if app.Training == nil || strings.TrimSpace(app.Training.Title) == "" {
		return nil, errors.New("training data missing on application")
	}

	fn := strings.TrimSpace(ptrStr(app.FirstName))
	ln := strings.TrimSpace(ptrStr(app.LastName))
	student := strings.TrimSpace(fn + " " + ln)
	if student == "" {
		return nil, errors.New("applicant name is empty")
	}

	issue := time.Now().UTC().Truncate(24 * time.Hour)

	c := &models.Certificate{
		ID:            uuid.New(),
		StudentName:   student,
		TrainingName:  strings.TrimSpace(app.Training.Title),
		FromDate:      fromD.UTC(),
		ToDate:        toD.UTC(),
		IssueDate:     issue,
		ApplicationID: &aid,
	}
	if err := s.certRepo.CreateWithNumber(c); err != nil {
		return nil, err
	}
	return c, nil
}

func ptrStr(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}

// GetByCertificateNo returns the certificate or ErrCertificateNotFound.
func (s *CertificateRegistryService) GetByCertificateNo(no string) (*models.Certificate, error) {
	return s.certRepo.MustGetByCertificateNo(strings.TrimSpace(no))
}

// GetPublicMetadata returns stored certificate data or resolves phone-issued “ephemeral” certificate numbers
// (BCF-…-XXXXXXXX and BCF-…-FT-XXXXXXXX) for the public /verify page and QR codes.
func (s *CertificateRegistryService) GetPublicMetadata(no string) (map[string]interface{}, error) {
	no = strings.TrimSpace(no)
	if no == "" {
		return nil, ErrCertificateNotFound
	}
	if c, err := s.certRepo.MustGetByCertificateNo(no); err == nil {
		return ToCertificateDTO(c), nil
	} else if !errors.Is(err, ErrCertificateNotFound) {
		return nil, err
	}
	return s.ephemeralPublicMetadata(no)
}

func (s *CertificateRegistryService) ephemeralPublicMetadata(no string) (map[string]interface{}, error) {
	if m := reEphemeralFreeCert.FindStringSubmatch(no); len(m) == 3 {
		reg, err := s.freeTrainRepo.FindRegistrationByCertificateEphemeralPrefix(m[2])
		if err != nil {
			return nil, ErrCertificateNotFound
		}
		return ephemeralFreeTrainingMetadataMap(reg, no), nil
	}
	if m := reEphemeralPaidCert.FindStringSubmatch(no); len(m) == 3 {
		app, err := s.appRepo.FindByCertificateEphemeralPrefix(m[2])
		if err != nil {
			return nil, ErrCertificateNotFound
		}
		return ephemeralPaidApplicationMetadataMap(app, no), nil
	}
	return nil, ErrCertificateNotFound
}

func ephemeralFreeTrainingMetadataMap(reg *models.FreeTrainingRegistration, certNo string) map[string]interface{} {
	student := strings.TrimSpace(reg.FullName)
	if student == "" {
		student = "Participant"
	}
	title := ""
	if reg.Program != nil {
		title = strings.TrimSpace(reg.Program.Title)
	}
	if title == "" {
		title = "Free training"
	}
	day := time.Now().UTC().Truncate(24 * time.Hour).Format("2006-01-02")
	return map[string]interface{}{
		"student_name":   student,
		"training_name":  title,
		"from_date":      day,
		"to_date":        day,
		"certificate_no": certNo,
		"issue_date":     day,
	}
}

func ephemeralPaidApplicationMetadataMap(app *models.Application, certNo string) map[string]interface{} {
	fn := strings.TrimSpace(ptrStr(app.FirstName))
	ln := strings.TrimSpace(ptrStr(app.LastName))
	student := strings.TrimSpace(fn + " " + ln)
	title := ""
	if app.Training != nil {
		title = strings.TrimSpace(app.Training.Title)
	}
	day := time.Now().UTC().Truncate(24 * time.Hour).Format("2006-01-02")
	return map[string]interface{}{
		"student_name":   student,
		"training_name":  title,
		"from_date":      day,
		"to_date":        day,
		"certificate_no": certNo,
		"issue_date":     day,
		"application_id": app.ID,
	}
}

// RenderCertificatePDFByNumber renders a PDF for registry or ephemeral certificate numbers.
func (s *CertificateRegistryService) RenderCertificatePDFByNumber(no string) ([]byte, string, error) {
	no = strings.TrimSpace(no)
	if no == "" {
		return nil, "", ErrCertificateNotFound
	}
	if c, err := s.certRepo.MustGetByCertificateNo(no); err == nil {
		b, err := s.RenderCertificatePDF(c)
		if err != nil {
			return nil, "", err
		}
		return b, "certificate-" + strings.ReplaceAll(c.CertificateNo, "/", "-") + ".pdf", nil
	} else if !errors.Is(err, ErrCertificateNotFound) {
		return nil, "", err
	}
	return s.renderEphemeralCertificatePDF(no)
}

func (s *CertificateRegistryService) renderEphemeralCertificatePDF(no string) ([]byte, string, error) {
	meta, err := s.ephemeralPublicMetadata(no)
	if err != nil {
		return nil, "", err
	}
	student, _ := meta["student_name"].(string)
	training, _ := meta["training_name"].(string)
	certNo, _ := meta["certificate_no"].(string)
	fromD, _ := meta["from_date"].(string)
	toD, _ := meta["to_date"].(string)
	issueD, _ := meta["issue_date"].(string)

	fromDisp := fromD
	toDisp := toD
	issueDisp := issueD
	if t, err := time.Parse("2006-01-02", fromD); err == nil {
		fromDisp = t.Format("Jan 2, 2006")
	}
	if t, err := time.Parse("2006-01-02", toD); err == nil {
		toDisp = t.Format("Jan 2, 2006")
	}
	if t, err := time.Parse("2006-01-02", issueD); err == nil {
		issueDisp = t.Format("Jan 2, 2006")
	}

	data := pdf.CertificateData{
		StudentName:         student,
		TrainingName:        training,
		FromDate:            fromDisp,
		ToDate:              toDisp,
		CertificateNo:       certNo,
		IssueDate:           issueDisp,
		SignatoryName:       s.cfg.CertificateSignatoryName,
		SignatoryTitle:      s.cfg.CertificateSignatoryTitle,
		VerifyPublicBaseURL: s.cfg.CertificateVerifyBaseURLForQR(),
		HeaderLogoURL:       s.cfg.CertificateLogoURL,
	}
	out, err := pdf.FillCertificateLikeRegistry(s.cfg.CertificateTemplateURL, data)
	if err != nil {
		return nil, "", err
	}
	filename := fmt.Sprintf("certificate-%s.pdf", strings.ReplaceAll(certNo, "/", "-"))
	return out, filename, nil
}

// RenderCertificatePDF builds the PDF for download (strip form widgets, then styled text overlay).
func (s *CertificateRegistryService) RenderCertificatePDF(c *models.Certificate) ([]byte, error) {
	fromDisp := c.FromDate.UTC().Format("Jan 2, 2006")
	toDisp := c.ToDate.UTC().Format("Jan 2, 2006")
	issueDisp := c.IssueDate.UTC().Format("Jan 2, 2006")

	overlay := pdf.CertificateDataFromRegistry(
		c.StudentName,
		c.TrainingName,
		fromDisp,
		toDisp,
		c.CertificateNo,
		issueDisp,
		s.cfg.CertificateSignatoryName,
		s.cfg.CertificateSignatoryTitle,
		s.cfg.CertificateVerifyBaseURLForQR(),
		s.cfg.CertificateLogoURL,
		"",
	)
	return pdf.FillRegistryTemplate(s.cfg.CertificateTemplateURL, overlay)
}

// ToPublicDTO strips internal fields if needed (optional JSON shape for GET).
func ToCertificateDTO(c *models.Certificate) map[string]interface{} {
	return map[string]interface{}{
		"id":               c.ID,
		"student_name":     c.StudentName,
		"training_name":    c.TrainingName,
		"from_date":        c.FromDate.Format("2006-01-02"),
		"to_date":          c.ToDate.Format("2006-01-02"),
		"certificate_no":   c.CertificateNo,
		"issue_date":       c.IssueDate.Format("2006-01-02"),
		"application_id":   c.ApplicationID,
		"created_at":       c.CreatedAt,
	}
}
