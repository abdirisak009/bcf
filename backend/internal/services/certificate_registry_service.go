package services

import (
	"errors"
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
)

type CertificateRegistryService struct {
	certRepo *repositories.CertificateRepository
	appRepo  *repositories.ApplicationRepository
	cfg      *config.Config
}

func NewCertificateRegistryService(certRepo *repositories.CertificateRepository, appRepo *repositories.ApplicationRepository, cfg *config.Config) *CertificateRegistryService {
	return &CertificateRegistryService{certRepo: certRepo, appRepo: appRepo, cfg: cfg}
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
