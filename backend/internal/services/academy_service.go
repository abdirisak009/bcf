package services

import (
	"errors"
	"strings"

	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
)

var ErrAcademyNameRequired = errors.New("name is required")

type AcademyService struct {
	repo *repositories.AcademyRepository
}

func NewAcademyService(repo *repositories.AcademyRepository) *AcademyService {
	return &AcademyService{repo: repo}
}

func (s *AcademyService) List(limit, offset int) ([]models.Academy, error) {
	if limit <= 0 {
		limit = 20
	}
	return s.repo.List(limit, offset)
}

func (s *AcademyService) ListWithTrainings() ([]models.Academy, error) {
	return s.repo.ListWithTrainings()
}

func (s *AcademyService) GetByID(id uuid.UUID) (*models.Academy, error) {
	return s.repo.GetByID(id)
}

func (s *AcademyService) Create(a *models.Academy) error {
	a.Name = strings.TrimSpace(a.Name)
	if a.Name == "" {
		return ErrAcademyNameRequired
	}
	return s.repo.Create(a)
}

func (s *AcademyService) Update(a *models.Academy) error {
	a.Name = strings.TrimSpace(a.Name)
	if a.Name == "" {
		return ErrAcademyNameRequired
	}
	return s.repo.Update(a)
}

func (s *AcademyService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
