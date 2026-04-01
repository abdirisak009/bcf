package services

import (
	"errors"
	"regexp"
	"strings"
	"unicode"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
)

var (
	ErrFreeTrainingNotFound        = errors.New("free training program not found")
	ErrFreeTrainingInactive        = errors.New("this registration is not open")
	ErrFreeTrainingInvalidSlug     = errors.New("invalid slug")
	ErrFreeTrainingInvalidStatus     = errors.New("invalid registration status")
	ErrCertificateDownloadDisabled = errors.New("certificate download is disabled for this program")
	ErrInvalidPhoneForCertificate  = errors.New("invalid phone for certificate")
)

// FreeTrainingCertChoice is one eligible free-training program for certificate download (multi-select UX).
type FreeTrainingCertChoice struct {
	ProgramID uuid.UUID `json:"program_id"`
	Slug      string    `json:"slug"`
	Title     string    `json:"title"`
}

// MultipleFreeTrainingCertificatesError is returned when more than one free training matches the phone.
type MultipleFreeTrainingCertificatesError struct {
	Choices []FreeTrainingCertChoice
}

func (e *MultipleFreeTrainingCertificatesError) Error() string {
	return "multiple free training programs match; choose one"
}

var slugRe = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

const defaultSuccessMsg = "Thank you for registering. If you are shortlisted, our team will contact you using the details you provided."

// DefaultSuccessMessage is the copy shown after registration when the program has no custom message.
func DefaultSuccessMessage() string {
	return defaultSuccessMsg
}

type FreeTrainingService struct {
	repo *repositories.FreeTrainingRepository
}

func NewFreeTrainingService(repo *repositories.FreeTrainingRepository) *FreeTrainingService {
	return &FreeTrainingService{repo: repo}
}

func NormalizeSlug(s string) string {
	s = strings.TrimSpace(strings.ToLower(s))
	if s == "" {
		return ""
	}
	var b strings.Builder
	lastHyphen := false
	for _, r := range s {
		switch {
		case unicode.IsLetter(r) && r < unicode.MaxASCII:
			if r >= 'A' && r <= 'Z' {
				r = r - 'A' + 'a'
			}
			b.WriteRune(r)
			lastHyphen = false
		case unicode.IsDigit(r):
			b.WriteRune(r)
			lastHyphen = false
		case r == ' ' || r == '_' || r == '-':
			if b.Len() > 0 && !lastHyphen {
				b.WriteRune('-')
				lastHyphen = true
			}
		}
	}
	out := strings.Trim(b.String(), "-")
	for strings.Contains(out, "--") {
		out = strings.ReplaceAll(out, "--", "-")
	}
	return out
}

func (s *FreeTrainingService) CreateProgram(p *models.FreeTrainingProgram) error {
	p.Title = strings.TrimSpace(p.Title)
	p.Slug = NormalizeSlug(p.Slug)
	if p.Title == "" {
		return errors.New("title is required")
	}
	if p.Slug == "" || !slugRe.MatchString(p.Slug) {
		return ErrFreeTrainingInvalidSlug
	}
	p.VenueLocation = strings.TrimSpace(p.VenueLocation)
	p.Content = strings.TrimSpace(p.Content)
	p.Outcomes = strings.TrimSpace(p.Outcomes)
	if p.VenueLocation == "" || p.Content == "" || p.Outcomes == "" {
		return errors.New("venue, content, and outcomes are required")
	}
	if strings.TrimSpace(p.SuccessMessage) == "" {
		p.SuccessMessage = defaultSuccessMsg
	}
	if p.CertificateSignatureImageURL != nil {
		st := strings.TrimSpace(*p.CertificateSignatureImageURL)
		if st == "" {
			p.CertificateSignatureImageURL = nil
		} else {
			v := st
			p.CertificateSignatureImageURL = &v
		}
	}
	return s.repo.CreateProgram(p)
}

func (s *FreeTrainingService) UpdateProgram(id uuid.UUID, patch *models.FreeTrainingProgram) error {
	existing, err := s.repo.GetProgramByID(id)
	if err != nil {
		return ErrFreeTrainingNotFound
	}
	if t := strings.TrimSpace(patch.Title); t != "" {
		existing.Title = t
	}
	if patch.Slug != "" {
		ns := NormalizeSlug(patch.Slug)
		if ns == "" || !slugRe.MatchString(ns) {
			return ErrFreeTrainingInvalidSlug
		}
		existing.Slug = ns
	}
	v := strings.TrimSpace(patch.VenueLocation)
	if v == "" {
		return errors.New("venue_location is required")
	}
	existing.VenueLocation = v
	c := strings.TrimSpace(patch.Content)
	if c == "" {
		return errors.New("content is required")
	}
	existing.Content = c
	o := strings.TrimSpace(patch.Outcomes)
	if o == "" {
		return errors.New("outcomes is required")
	}
	existing.Outcomes = o
	sm := strings.TrimSpace(patch.SuccessMessage)
	if sm == "" {
		existing.SuccessMessage = defaultSuccessMsg
	} else {
		existing.SuccessMessage = sm
	}
	existing.IsActive = patch.IsActive
	existing.CertificateDownloadEnabled = patch.CertificateDownloadEnabled
	if patch.CertificateSignatureImageURL != nil {
		st := strings.TrimSpace(*patch.CertificateSignatureImageURL)
		if st == "" {
			existing.CertificateSignatureImageURL = nil
		} else {
			v := st
			existing.CertificateSignatureImageURL = &v
		}
	}
	return s.repo.UpdateProgram(existing)
}

func (s *FreeTrainingService) DeleteProgram(id uuid.UUID) error {
	if _, err := s.repo.GetProgramByID(id); err != nil {
		return ErrFreeTrainingNotFound
	}
	if err := s.repo.DeleteRegistrationsForProgram(id); err != nil {
		return err
	}
	return s.repo.DeleteProgram(id)
}

func (s *FreeTrainingService) GetProgramByID(id uuid.UUID) (*models.FreeTrainingProgram, error) {
	return s.repo.GetProgramByID(id)
}

func (s *FreeTrainingService) GetPublicBySlug(slug string) (*models.FreeTrainingProgram, error) {
	p, err := s.repo.GetProgramBySlug(slug)
	if err != nil {
		return nil, ErrFreeTrainingNotFound
	}
	if !p.IsActive {
		return nil, ErrFreeTrainingInactive
	}
	return p, nil
}

func (s *FreeTrainingService) ListProgramsAdmin() ([]models.FreeTrainingProgram, error) {
	return s.repo.ListPrograms(false)
}

func (s *FreeTrainingService) ListProgramsPublic() ([]models.FreeTrainingProgram, error) {
	return s.repo.ListPrograms(true)
}

func normalizeGender(g string) string {
	g = strings.TrimSpace(strings.ToLower(g))
	if g == "male" || g == "female" {
		return g
	}
	return ""
}

func (s *FreeTrainingService) Register(
	programSlug string,
	fullName, email, phone, location string,
	gender string,
	message *string,
) (*models.FreeTrainingRegistration, error) {
	p, err := s.GetPublicBySlug(programSlug)
	if err != nil {
		return nil, err
	}
	fullName = strings.TrimSpace(fullName)
	email = strings.TrimSpace(strings.ToLower(email))
	phone = strings.TrimSpace(phone)
	location = strings.TrimSpace(location)
	if fullName == "" || email == "" || location == "" {
		return nil, errors.New("full name, email, and location are required")
	}
	if !strings.Contains(email, "@") {
		return nil, errors.New("valid email is required")
	}
	reg := &models.FreeTrainingRegistration{
		ProgramID: p.ID,
		FullName:  fullName,
		Email:     email,
		Phone:     phone,
		Location:  location,
		Gender:    normalizeGender(gender),
		Message:   message,
		Status:    "pending_review",
	}
	if err := s.repo.CreateRegistration(reg); err != nil {
		return nil, err
	}
	// Return the row as stored (ensures gender and all columns match DB).
	fresh, err := s.repo.GetRegistrationByID(reg.ID)
	if err != nil {
		return reg, nil
	}
	return fresh, nil
}

func (s *FreeTrainingService) ListRegistrations(programID *uuid.UUID, sort, order string, limit, offset int) ([]models.FreeTrainingRegistration, error) {
	return s.repo.ListRegistrations(programID, sort, order, limit, offset)
}

func (s *FreeTrainingService) GetRegistration(id uuid.UUID) (*models.FreeTrainingRegistration, error) {
	return s.repo.GetRegistrationByID(id)
}

var allowedRegStatuses = map[string]struct{}{
	"pending_review": {},
	"shortlisted":    {},
	"precepts":       {},
	"not_selected":   {},
	"contacted":      {},
}

func (s *FreeTrainingService) UpdateRegistration(id uuid.UUID, status string, adminNotes *string, gender *string) (*models.FreeTrainingRegistration, error) {
	reg, err := s.repo.GetRegistrationByID(id)
	if err != nil {
		return nil, errors.New("registration not found")
	}
	st := strings.TrimSpace(strings.ToLower(status))
	if st != "" {
		if _, ok := allowedRegStatuses[st]; !ok {
			return nil, ErrFreeTrainingInvalidStatus
		}
		reg.Status = st
	}
	if adminNotes != nil {
		t := strings.TrimSpace(*adminNotes)
		if t == "" {
			reg.AdminNotes = nil
		} else {
			reg.AdminNotes = &t
		}
	}
	if gender != nil {
		g := normalizeGender(*gender)
		reg.Gender = g
	}
	if err := s.repo.UpdateRegistration(reg); err != nil {
		return nil, err
	}
	return s.repo.GetRegistrationByID(id)
}

// FindRegistrationForCertificate resolves an active program by slug and the participant's phone (Shortlisted or Precepts only).
func (s *FreeTrainingService) FindRegistrationForCertificate(slug, phone string) (*models.FreeTrainingRegistration, *models.FreeTrainingProgram, error) {
	p, err := s.GetPublicBySlug(slug)
	if err != nil {
		return nil, nil, err
	}
	if !p.CertificateDownloadEnabled {
		return nil, nil, ErrCertificateDownloadDisabled
	}
	digits := repositories.NormalizePhoneDigits(phone)
	if len(digits) < 6 {
		return nil, nil, ErrInvalidPhoneForCertificate
	}
	reg, err := s.repo.FindRegistrationForCertificate(p.ID, digits)
	if err != nil {
		return nil, nil, err
	}
	return reg, p, nil
}

// ResolveRegistrationForCertificateByPhone picks one eligible free-training registration.
// If programID is nil and several programs match, returns *MultipleFreeTrainingCertificatesError with choices.
// If programID is set, that program must have certificate download enabled and a matching eligible registration.
func (s *FreeTrainingService) ResolveRegistrationForCertificateByPhone(phone string, programID *uuid.UUID) (*models.FreeTrainingRegistration, *models.FreeTrainingProgram, error) {
	digits := repositories.NormalizePhoneDigits(phone)
	if len(digits) < 6 {
		return nil, nil, ErrInvalidPhoneForCertificate
	}
	if programID != nil {
		p, err := s.repo.GetProgramByID(*programID)
		if err != nil {
			return nil, nil, err
		}
		if !p.CertificateDownloadEnabled {
			return nil, nil, ErrCertificateDownloadDisabled
		}
		reg, err := s.repo.FindRegistrationForCertificate(*programID, digits)
		if err != nil {
			return nil, nil, err
		}
		reg.Program = p
		return reg, p, nil
	}
	rows, err := s.repo.FindAllEligibleRegistrationsForCertificateByPhone(digits)
	if err != nil {
		return nil, nil, err
	}
	if len(rows) == 0 {
		return nil, nil, gorm.ErrRecordNotFound
	}
	if len(rows) == 1 {
		r := rows[0]
		if r.Program == nil {
			p, err := s.repo.GetProgramByID(r.ProgramID)
			if err != nil {
				return nil, nil, err
			}
			r.Program = p
		}
		return &r, r.Program, nil
	}
	choices := make([]FreeTrainingCertChoice, 0, len(rows))
	for i := range rows {
		r := &rows[i]
		if r.Program == nil {
			p, err := s.repo.GetProgramByID(r.ProgramID)
			if err != nil {
				return nil, nil, err
			}
			r.Program = p
		}
		choices = append(choices, FreeTrainingCertChoice{
			ProgramID: r.Program.ID,
			Slug:      r.Program.Slug,
			Title:     strings.TrimSpace(r.Program.Title),
		})
	}
	return nil, nil, &MultipleFreeTrainingCertificatesError{Choices: choices}
}

func (s *FreeTrainingService) DeleteRegistration(id uuid.UUID) error {
	if _, err := s.repo.GetRegistrationByID(id); err != nil {
		return errors.New("registration not found")
	}
	return s.repo.DeleteRegistration(id)
}
