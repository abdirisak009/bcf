package services

import (
	"errors"
	"strings"

	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
)

type ProjectService struct {
	repo    *repositories.ProjectRepository
	expRepo *repositories.ExpenseRepository
}

func NewProjectService(repo *repositories.ProjectRepository, expRepo *repositories.ExpenseRepository) *ProjectService {
	return &ProjectService{repo: repo, expRepo: expRepo}
}

func (s *ProjectService) enrichProjectsWithExpenseTotals(projects []models.Project) error {
	if s.expRepo == nil || len(projects) == 0 {
		return nil
	}
	ids := make([]uuid.UUID, len(projects))
	for i := range projects {
		ids[i] = projects[i].ID
	}
	sums, err := s.expRepo.SumAmountsByProjectID(ids)
	if err != nil {
		return err
	}
	for i := range projects {
		p := &projects[i]
		spent := sums[p.ID]
		p.ExpenseTotal = &spent
		if p.ContractValue != nil {
			b := *p.ContractValue - spent
			p.Balance = &b
		}
	}
	return nil
}

func (s *ProjectService) Create(p *models.Project) error {
	if p.Name == "" {
		return errors.New("name is required")
	}
	if strings.TrimSpace(p.ContractCurrency) == "" {
		p.ContractCurrency = "USD"
	}
	normalizeProjectStatus(p)
	if err := validateProjectStatusValue(p.Status); err != nil {
		return err
	}
	if err := validateMilestonePct(p); err != nil {
		return err
	}
	if err := validateContractPeriod(p); err != nil {
		return err
	}
	return s.repo.Create(p)
}

func (s *ProjectService) List(limit, offset int) ([]models.Project, error) {
	rows, err := s.repo.List(limit, offset)
	if err != nil {
		return nil, err
	}
	if err := s.enrichProjectsWithExpenseTotals(rows); err != nil {
		return nil, err
	}
	return rows, nil
}

func (s *ProjectService) GetByID(id uuid.UUID) (*models.Project, error) {
	p, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	rows := []models.Project{*p}
	if err := s.enrichProjectsWithExpenseTotals(rows); err != nil {
		return nil, err
	}
	return &rows[0], nil
}

func (s *ProjectService) Update(p *models.Project) error {
	if p.Name == "" {
		return errors.New("name is required")
	}
	if strings.TrimSpace(p.ContractCurrency) == "" {
		p.ContractCurrency = "USD"
	}
	normalizeProjectStatus(p)
	if err := validateProjectStatusValue(p.Status); err != nil {
		return err
	}
	if err := validateMilestonePct(p); err != nil {
		return err
	}
	if err := validateContractPeriod(p); err != nil {
		return err
	}
	return s.repo.Update(p)
}

func normalizeProjectStatus(p *models.Project) {
	s := strings.TrimSpace(strings.ToLower(p.Status))
	if s == "" {
		s = models.ProjectStatusActive
	}
	p.Status = s
}

func validateProjectStatusValue(s string) error {
	switch s {
	case models.ProjectStatusPlanning, models.ProjectStatusActive, models.ProjectStatusOnHold,
		models.ProjectStatusCompleted, models.ProjectStatusCancelled:
		return nil
	default:
		return errors.New("invalid project status")
	}
}

func validateMilestonePct(p *models.Project) error {
	if p.MilestonePct == nil {
		return nil
	}
	v := *p.MilestonePct
	if v < 0 || v > 100 {
		return errors.New("milestone percent must be between 0 and 100")
	}
	return nil
}

func validateContractPeriod(p *models.Project) error {
	a := p.ContractStart
	b := p.ContractEnd
	if a == nil || b == nil {
		return nil
	}
	sa := strings.TrimSpace(*a)
	sb := strings.TrimSpace(*b)
	if len(sa) < 10 || len(sb) < 10 {
		return nil
	}
	if sb < sa {
		return errors.New("contract end date must be on or after start date")
	}
	return nil
}

func (s *ProjectService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
