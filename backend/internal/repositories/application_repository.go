package repositories

import (
	"strings"
	"unicode"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

// CertificateEligibleStatuses are application statuses allowed to download a certificate.
var CertificateEligibleStatuses = []string{"approved", "accepted", "completed", "reviewed"}

type ApplicationRepository struct {
	db *gorm.DB
}

func NewApplicationRepository(db *gorm.DB) *ApplicationRepository {
	return &ApplicationRepository{db: db}
}

func (r *ApplicationRepository) Create(a *models.Application) error {
	return r.db.Create(a).Error
}

func (r *ApplicationRepository) List(limit, offset int) ([]models.Application, error) {
	var rows []models.Application
	err := r.db.Preload("Training").Preload("Training.Academy").Order("created_at DESC").Limit(limit).Offset(offset).Find(&rows).Error
	return rows, err
}

func (r *ApplicationRepository) GetByID(id uuid.UUID) (*models.Application, error) {
	var a models.Application
	err := r.db.Preload("Training").Preload("Training.Academy").Where("id = ?", id).First(&a).Error
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *ApplicationRepository) Update(a *models.Application) error {
	// Avoid persisting nested Training on update.
	a.Training = nil
	return r.db.Save(a).Error
}

func (r *ApplicationRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Application{}, "id = ?", id).Error
}

// FindForCertificate returns the latest matching application: same training, email, first/last name,
// and status in CertificateEligibleStatuses.
func (r *ApplicationRepository) FindForCertificate(trainingID uuid.UUID, email, firstName, lastName string) (*models.Application, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	firstName = strings.TrimSpace(firstName)
	lastName = strings.TrimSpace(lastName)
	if trainingID == uuid.Nil || email == "" || firstName == "" || lastName == "" {
		return nil, gorm.ErrRecordNotFound
	}
	var a models.Application
	err := r.db.Preload("Training").Preload("Training.Academy").
		Where("training_id = ?", trainingID).
		Where("LOWER(TRIM(email)) = ?", email).
		Where("LOWER(TRIM(COALESCE(first_name,''))) = LOWER(TRIM(?))", firstName).
		Where("LOWER(TRIM(COALESCE(last_name,''))) = LOWER(TRIM(?))", lastName).
		Where("status IN ?", CertificateEligibleStatuses).
		Order("created_at DESC").
		First(&a).Error
	if err != nil {
		return nil, err
	}
	return &a, nil
}

// NormalizePhoneDigits keeps only ASCII digits (handles +252, spaces, dashes).
func NormalizePhoneDigits(s string) string {
	var b strings.Builder
	for _, r := range s {
		if unicode.IsDigit(r) {
			b.WriteRune(r)
		}
	}
	return b.String()
}

// FindForCertificateByPhone returns the latest approved application whose stored phone
// matches the given number after normalizing both to digits only (PostgreSQL).
func (r *ApplicationRepository) FindForCertificateByPhone(phone string) (*models.Application, error) {
	n := NormalizePhoneDigits(phone)
	if len(n) < 6 {
		return nil, gorm.ErrRecordNotFound
	}
	var a models.Application
	err := r.db.Preload("Training").Preload("Training.Academy").
		Where("status = ?", "approved").
		Where("regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g') = ?", n).
		Order("created_at DESC").
		First(&a).Error
	if err != nil {
		return nil, err
	}
	return &a, nil
}

// FindByCertificateEphemeralPrefix finds an application whose UUID string starts with the given 8 hex characters
// (matches BCF-{year}-{prefix} certificates from issue-by-phone).
func (r *ApplicationRepository) FindByCertificateEphemeralPrefix(prefix8 string) (*models.Application, error) {
	prefix8 = strings.ToLower(strings.TrimSpace(prefix8))
	if len(prefix8) != 8 {
		return nil, gorm.ErrRecordNotFound
	}
	var a models.Application
	err := r.db.Preload("Training").
		Where("SUBSTRING(training_applications.id::text, 1, 8) = ?", prefix8).
		Where("status = ?", "approved").
		First(&a).Error
	if err != nil {
		return nil, err
	}
	return &a, nil
}
