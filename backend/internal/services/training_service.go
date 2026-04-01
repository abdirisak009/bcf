package services

import (
	"errors"
	"strings"

	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
)

var ErrTrainingTitleRequired = errors.New("title is required")

type TrainingService struct {
	repo *repositories.TrainingRepository
}

func NewTrainingService(repo *repositories.TrainingRepository) *TrainingService {
	return &TrainingService{repo: repo}
}

func (s *TrainingService) List(limit, offset int) ([]models.Training, error) {
	if limit <= 0 {
		limit = 20
	}
	return s.repo.List(limit, offset)
}

func (s *TrainingService) GetByID(id uuid.UUID) (*models.Training, error) {
	return s.repo.GetByID(id)
}

func (s *TrainingService) Create(t *models.Training) error {
	t.Title = strings.TrimSpace(t.Title)
	if t.Title == "" {
		return ErrTrainingTitleRequired
	}
	t.CertificateSignatureImageURL = normalizeCertSigURLPtr(t.CertificateSignatureImageURL)
	return s.repo.Create(t)
}

func (s *TrainingService) Update(t *models.Training) error {
	t.Title = strings.TrimSpace(t.Title)
	if t.Title == "" {
		return ErrTrainingTitleRequired
	}
	t.CertificateSignatureImageURL = normalizeCertSigURLPtr(t.CertificateSignatureImageURL)
	return s.repo.Update(t)
}

func normalizeCertSigURLPtr(p *string) *string {
	if p == nil {
		return nil
	}
	st := strings.TrimSpace(*p)
	if st == "" {
		return nil
	}
	v := st
	return &v
}

func (s *TrainingService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
