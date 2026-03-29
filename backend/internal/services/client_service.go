package services

import (
	"errors"
	"strings"

	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
)

type ClientService struct {
	repo *repositories.ClientRepository
}

func NewClientService(repo *repositories.ClientRepository) *ClientService {
	return &ClientService{repo: repo}
}

func (s *ClientService) Create(c *models.Client) error {
	c.Name = strings.TrimSpace(c.Name)
	if c.Name == "" {
		return errors.New("name is required")
	}
	return s.repo.Create(c)
}

func (s *ClientService) List(limit, offset int) ([]models.Client, error) {
	return s.repo.List(limit, offset)
}

func (s *ClientService) GetByID(id uuid.UUID) (*models.Client, error) {
	return s.repo.GetByID(id)
}

func (s *ClientService) Update(c *models.Client) error {
	c.Name = strings.TrimSpace(c.Name)
	if c.Name == "" {
		return errors.New("name is required")
	}
	return s.repo.Update(c)
}

func (s *ClientService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
