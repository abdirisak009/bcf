package services

import (
	"errors"
	"time"

	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/pdf"
	"github.com/bararug/website-backend/internal/repositories"
)

type InvoiceService struct {
	repo           *repositories.InvoiceRepository
	payRepo        *repositories.PaymentRepository
	clientRepo     *repositories.ClientRepository
	trainRepo      *repositories.TrainingRepository
	projRepo       *repositories.ProjectRepository
	invoiceLogoURL        string
	invoiceCompanyAddress string
}

func NewInvoiceService(
	repo *repositories.InvoiceRepository,
	payRepo *repositories.PaymentRepository,
	clientRepo *repositories.ClientRepository,
	trainRepo *repositories.TrainingRepository,
	projRepo *repositories.ProjectRepository,
	invoiceLogoURL string,
	invoiceCompanyAddress string,
) *InvoiceService {
	return &InvoiceService{
		repo:                  repo,
		payRepo:               payRepo,
		clientRepo:            clientRepo,
		trainRepo:             trainRepo,
		projRepo:              projRepo,
		invoiceLogoURL:        invoiceLogoURL,
		invoiceCompanyAddress: invoiceCompanyAddress,
	}
}

// RenderPDF returns a branded PDF for a loaded invoice (paid total from payments table).
func (s *InvoiceService) RenderPDF(inv *models.Invoice) ([]byte, error) {
	paid, err := s.payRepo.SumAmountForInvoice(inv.ID)
	if err != nil {
		return nil, err
	}
	return pdf.RenderInvoice(inv, paid, s.invoiceLogoURL, s.invoiceCompanyAddress)
}

func (s *InvoiceService) Create(inv *models.Invoice, createdBy *uuid.UUID) error {
	if inv.Amount < 0 || inv.ClientID == uuid.Nil {
		return errors.New("client_id and valid amount are required")
	}
	if inv.Currency == "" {
		inv.Currency = "USD"
	}
	if _, err := s.clientRepo.GetByID(inv.ClientID); err != nil {
		return errors.New("client not found")
	}
	if inv.ProjectID != nil {
		if _, err := s.projRepo.GetByID(*inv.ProjectID); err != nil {
			return errors.New("project not found")
		}
	}
	if inv.TrainingID != nil {
		if _, err := s.trainRepo.GetByID(*inv.TrainingID); err != nil {
			return errors.New("training not found")
		}
	}
	if inv.ProjectID != nil && inv.TrainingID != nil {
		return errors.New("set at most one of project_id or training_id")
	}
	inv.CreatedBy = createdBy
	if inv.Status == "" {
		inv.Status = models.InvoiceStatusUnpaid
	}
	if err := s.repo.CreateWithNumber(inv); err != nil {
		return err
	}
	return s.RecalculateInvoice(inv.ID)
}

func (s *InvoiceService) List(limit, offset int, status, clientID string) ([]models.Invoice, error) {
	rows, err := s.repo.List(limit, offset, status, clientID)
	if err != nil {
		return nil, err
	}
	now := time.Now()
	for i := range rows {
		if err := s.applyComputedStatus(&rows[i], now); err != nil {
			return nil, err
		}
	}
	return rows, nil
}

func (s *InvoiceService) GetByID(id uuid.UUID) (*models.Invoice, error) {
	inv, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	now := time.Now()
	if err := s.applyComputedStatus(inv, now); err != nil {
		return nil, err
	}
	return inv, nil
}

func (s *InvoiceService) Update(inv *models.Invoice) error {
	if inv.Amount < 0 || inv.ClientID == uuid.Nil {
		return errors.New("invalid amount or client")
	}
	if inv.Currency == "" {
		inv.Currency = "USD"
	}
	if _, err := s.clientRepo.GetByID(inv.ClientID); err != nil {
		return errors.New("client not found")
	}
	if inv.ProjectID != nil {
		if _, err := s.projRepo.GetByID(*inv.ProjectID); err != nil {
			return errors.New("project not found")
		}
	}
	if inv.TrainingID != nil {
		if _, err := s.trainRepo.GetByID(*inv.TrainingID); err != nil {
			return errors.New("training not found")
		}
	}
	if inv.ProjectID != nil && inv.TrainingID != nil {
		return errors.New("set at most one of project_id or training_id")
	}
	if err := s.repo.Update(inv); err != nil {
		return err
	}
	return s.RecalculateInvoice(inv.ID)
}

func (s *InvoiceService) Delete(id uuid.UUID) error {
	sum, err := s.payRepo.SumAmountForInvoice(id)
	if err != nil {
		return err
	}
	if sum > 0 {
		return errors.New("cannot delete invoice that has payments recorded")
	}
	return s.repo.Delete(id)
}

// RecalculateInvoice syncs status from payments and due date.
func (s *InvoiceService) RecalculateInvoice(id uuid.UUID) error {
	inv, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	paid, err := s.payRepo.SumAmountForInvoice(id)
	if err != nil {
		return err
	}
	status := computeInvoiceStatus(inv.Amount, paid, inv.DueDate, time.Now())
	if inv.Status != status {
		return s.repo.UpdateStatus(id, status)
	}
	return nil
}

func (s *InvoiceService) applyComputedStatus(inv *models.Invoice, now time.Time) error {
	paid, err := s.payRepo.SumAmountForInvoice(inv.ID)
	if err != nil {
		return err
	}
	want := computeInvoiceStatus(inv.Amount, paid, inv.DueDate, now)
	if want != inv.Status {
		if err := s.repo.UpdateStatus(inv.ID, want); err != nil {
			return err
		}
		inv.Status = want
	}
	return nil
}

func computeInvoiceStatus(amount, paid float64, due time.Time, now time.Time) string {
	if amount <= 0 {
		return models.InvoiceStatusPaid
	}
	if paid >= amount {
		return models.InvoiceStatusPaid
	}
	dueDay := time.Date(due.Year(), due.Month(), due.Day(), 0, 0, 0, 0, time.UTC)
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	if today.After(dueDay) && paid < amount {
		return models.InvoiceStatusOverdue
	}
	if paid > 0 {
		return models.InvoiceStatusPartial
	}
	return models.InvoiceStatusUnpaid
}
