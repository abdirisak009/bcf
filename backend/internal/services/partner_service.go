package services

import (
	"errors"
	"strings"

	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
)

type PartnerService struct {
	repo *repositories.PartnerRepository
}

func NewPartnerService(repo *repositories.PartnerRepository) *PartnerService {
	return &PartnerService{repo: repo}
}

func (s *PartnerService) Create(p *models.Partner) error {
	p.Name = strings.TrimSpace(p.Name)
	if p.Name == "" {
		return errors.New("name is required")
	}
	return s.repo.Create(p)
}

func (s *PartnerService) List(limit, offset int) ([]models.Partner, error) {
	return s.repo.List(limit, offset)
}

func (s *PartnerService) GetByID(id uuid.UUID) (*models.Partner, error) {
	return s.repo.GetByID(id)
}

func (s *PartnerService) Update(p *models.Partner) error {
	p.Name = strings.TrimSpace(p.Name)
	if p.Name == "" {
		return errors.New("name is required")
	}
	return s.repo.Update(p)
}

func (s *PartnerService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
