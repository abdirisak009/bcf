package repositories

import (
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

// Free training statuses allowed to download a completion certificate (phone must match).
// Matches dashboard "Participants" (Shortlisted + Precepts only — not Contacted / main Registrations list).
var freeTrainingCertificateEligibleStatuses = []string{"shortlisted", "precepts"}

type FreeTrainingRepository struct {
	db *gorm.DB
}

func NewFreeTrainingRepository(db *gorm.DB) *FreeTrainingRepository {
	return &FreeTrainingRepository{db: db}
}

func (r *FreeTrainingRepository) CreateProgram(p *models.FreeTrainingProgram) error {
	return r.db.Create(p).Error
}

func (r *FreeTrainingRepository) UpdateProgram(p *models.FreeTrainingProgram) error {
	return r.db.Save(p).Error
}

func (r *FreeTrainingRepository) DeleteRegistrationsForProgram(programID uuid.UUID) error {
	return r.db.Where("program_id = ?", programID).Delete(&models.FreeTrainingRegistration{}).Error
}

func (r *FreeTrainingRepository) DeleteProgram(id uuid.UUID) error {
	return r.db.Delete(&models.FreeTrainingProgram{}, "id = ?", id).Error
}

func (r *FreeTrainingRepository) GetProgramByID(id uuid.UUID) (*models.FreeTrainingProgram, error) {
	var p models.FreeTrainingProgram
	err := r.db.First(&p, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *FreeTrainingRepository) GetProgramBySlug(slug string) (*models.FreeTrainingProgram, error) {
	slug = strings.TrimSpace(strings.ToLower(slug))
	var p models.FreeTrainingProgram
	err := r.db.Where("LOWER(TRIM(slug)) = ?", slug).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *FreeTrainingRepository) ListPrograms(activeOnly bool) ([]models.FreeTrainingProgram, error) {
	q := r.db.Order("created_at DESC")
	if activeOnly {
		q = q.Where("is_active = ?", true)
	}
	var rows []models.FreeTrainingProgram
	err := q.Find(&rows).Error
	return rows, err
}

func (r *FreeTrainingRepository) CreateRegistration(reg *models.FreeTrainingRegistration) error {
	return r.db.Create(reg).Error
}

func (r *FreeTrainingRepository) UpdateRegistration(reg *models.FreeTrainingRegistration) error {
	reg.Program = nil
	return r.db.Save(reg).Error
}

func (r *FreeTrainingRepository) DeleteRegistration(id uuid.UUID) error {
	return r.db.Delete(&models.FreeTrainingRegistration{}, "id = ?", id).Error
}

func (r *FreeTrainingRepository) GetRegistrationByID(id uuid.UUID) (*models.FreeTrainingRegistration, error) {
	var reg models.FreeTrainingRegistration
	err := r.db.Preload("Program").First(&reg, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &reg, nil
}

// FindRegistrationForCertificate returns the latest eligible registration for this program and phone (digits only).
func (r *FreeTrainingRepository) FindRegistrationForCertificate(programID uuid.UUID, phoneDigits string) (*models.FreeTrainingRegistration, error) {
	if len(phoneDigits) < 6 {
		return nil, gorm.ErrRecordNotFound
	}
	var reg models.FreeTrainingRegistration
	err := r.db.Preload("Program").
		Where("program_id = ?", programID).
		Where("regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g') = ?", phoneDigits).
		Where("status IN ?", freeTrainingCertificateEligibleStatuses).
		Order("created_at DESC").
		First(&reg).Error
	if err != nil {
		return nil, err
	}
	return &reg, nil
}

// FindAllEligibleRegistrationsForCertificateByPhone returns every eligible registration for this phone
// across programs with certificate download enabled (Shortlisted or Precepts).
func (r *FreeTrainingRepository) FindAllEligibleRegistrationsForCertificateByPhone(phoneDigits string) ([]models.FreeTrainingRegistration, error) {
	if len(phoneDigits) < 6 {
		return nil, nil
	}
	var rows []models.FreeTrainingRegistration
	err := r.db.Preload("Program").
		Joins(`INNER JOIN free_training_programs AS ftp ON ftp.id = free_training_registrations.program_id AND ftp.certificate_download_enabled = ?`, true).
		Where("free_training_registrations.status IN ?", freeTrainingCertificateEligibleStatuses).
		Where("regexp_replace(COALESCE(free_training_registrations.phone, ''), '[^0-9]', '', 'g') = ?", phoneDigits).
		Order("free_training_registrations.updated_at DESC, free_training_registrations.created_at DESC").
		Find(&rows).Error
	if err != nil {
		return nil, err
	}
	return rows, nil
}

func (r *FreeTrainingRepository) ListRegistrations(programID *uuid.UUID, sortField, order string, limit, offset int) ([]models.FreeTrainingRegistration, error) {
	q := r.db.Preload("Program").Model(&models.FreeTrainingRegistration{})
	if programID != nil && *programID != uuid.Nil {
		q = q.Where("program_id = ?", *programID)
	}
	col := "created_at"
	switch strings.ToLower(sortField) {
	case "full_name", "name":
		col = "full_name"
	case "email":
		col = "email"
	case "status":
		col = "status"
	case "location":
		col = "location"
	case "created_at":
		col = "created_at"
	}
	ord := "DESC"
	if strings.ToLower(order) == "asc" {
		ord = "ASC"
	}
	q = q.Order(col + " " + ord)
	if limit <= 0 || limit > 500 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	var rows []models.FreeTrainingRegistration
	err := q.Limit(limit).Offset(offset).Find(&rows).Error
	return rows, err
}

// FindRegistrationByCertificateEphemeralPrefix finds an eligible registration whose UUID string starts with the
// 8 hex characters (matches BCF-{year}-FT-{prefix} from free-training certificate download).
func (r *FreeTrainingRepository) FindRegistrationByCertificateEphemeralPrefix(prefix8 string) (*models.FreeTrainingRegistration, error) {
	prefix8 = strings.ToLower(strings.TrimSpace(prefix8))
	if len(prefix8) != 8 {
		return nil, gorm.ErrRecordNotFound
	}
	var reg models.FreeTrainingRegistration
	err := r.db.Preload("Program").
		Joins(`INNER JOIN free_training_programs AS ftp ON ftp.id = free_training_registrations.program_id AND ftp.certificate_download_enabled = ?`, true).
		Where("free_training_registrations.status IN ?", freeTrainingCertificateEligibleStatuses).
		Where("SUBSTRING(free_training_registrations.id::text, 1, 8) = ?", prefix8).
		First(&reg).Error
	if err != nil {
		return nil, err
	}
	return &reg, nil
}
