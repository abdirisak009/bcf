package services

import (
	"errors"
	"strings"

	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
)

var ErrPublicationTitleRequired = errors.New("title is required")

type PublicationService struct {
	repo *repositories.PublicationRepository
}

func NewPublicationService(repo *repositories.PublicationRepository) *PublicationService {
	return &PublicationService{repo: repo}
}

func (s *PublicationService) List(limit, offset int) ([]models.Publication, error) {
	if limit <= 0 {
		limit = 20
	}
	return s.repo.List(limit, offset)
}

func (s *PublicationService) GetByID(id uuid.UUID) (*models.Publication, error) {
	return s.repo.GetByID(id)
}

func normalizePublicationFileDisplayMode(s string) string {
	s = strings.TrimSpace(strings.ToLower(s))
	if s == "read" {
		return "read"
	}
	return "download"
}

func (s *PublicationService) Create(p *models.Publication) error {
	p.Title = strings.TrimSpace(p.Title)
	if p.Title == "" {
		return ErrPublicationTitleRequired
	}
	p.FileDisplayMode = normalizePublicationFileDisplayMode(p.FileDisplayMode)
	return s.repo.Create(p)
}

func (s *PublicationService) Update(p *models.Publication) error {
	p.Title = strings.TrimSpace(p.Title)
	if p.Title == "" {
		return ErrPublicationTitleRequired
	}
	p.FileDisplayMode = normalizePublicationFileDisplayMode(p.FileDisplayMode)
	return s.repo.Update(p)
}

func (s *PublicationService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
