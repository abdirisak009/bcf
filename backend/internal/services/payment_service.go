package services

import (
	"errors"
	"time"

	"github.com/google/uuid"

	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/repositories"
)

type PaymentService struct {
	repo        *repositories.PaymentRepository
	invoiceRepo *repositories.InvoiceRepository
	invoiceSvc  *InvoiceService
}

func NewPaymentService(
	repo *repositories.PaymentRepository,
	invoiceRepo *repositories.InvoiceRepository,
	invoiceSvc *InvoiceService,
) *PaymentService {
	return &PaymentService{
		repo:        repo,
		invoiceRepo: invoiceRepo,
		invoiceSvc:  invoiceSvc,
	}
}

func validPaymentType(t string) bool {
	switch t {
	case models.PaymentTypeTraining, models.PaymentTypeProject, models.PaymentTypeConsulting:
		return true
	default:
		return false
	}
}

func validPaymentMethod(m string) bool {
	switch m {
	case models.PaymentMethodCash, models.PaymentMethodBank, models.PaymentMethodMobile:
		return true
	default:
		return false
	}
}

func (s *PaymentService) Create(p *models.Payment, createdBy *uuid.UUID) error {
	if p.AmountPaid < 0 {
		return errors.New("invalid amount")
	}
	if !validPaymentType(p.PaymentType) {
		return errors.New("payment_type must be training, project, or consulting")
	}
	if p.Currency == "" {
		p.Currency = "USD"
	}
	if p.PaymentMethod == "" {
		p.PaymentMethod = models.PaymentMethodBank
	}
	if !validPaymentMethod(p.PaymentMethod) {
		return errors.New("payment_method must be cash, bank, or mobile")
	}
	if p.PaymentDate.IsZero() {
		p.PaymentDate = time.Now()
	}
	if p.ReferenceNumber == nil && p.Reference != nil {
		p.ReferenceNumber = p.Reference
	}
	p.CreatedBy = createdBy

	if p.InvoiceID != nil {
		if err := s.validateAgainstInvoice(*p.InvoiceID, p.AmountPaid, uuid.Nil); err != nil {
			return err
		}
	}

	if err := s.repo.Create(p); err != nil {
		return err
	}
	return s.recalcInvoices(p.InvoiceID, nil)
}

// validateAgainstInvoice checks outstanding; excludePaymentID skips a row when updating.
func (s *PaymentService) validateAgainstInvoice(invoiceID uuid.UUID, newAmount float64, excludePaymentID uuid.UUID) error {
	inv, err := s.invoiceRepo.GetByID(invoiceID)
	if err != nil {
		return errors.New("invoice not found")
	}
	paid, err := s.repo.SumAmountForInvoice(invoiceID)
	if err != nil {
		return err
	}
	if excludePaymentID != uuid.Nil {
		ex, err := s.repo.GetByID(excludePaymentID)
		if err == nil && ex.InvoiceID != nil && *ex.InvoiceID == invoiceID {
			paid -= ex.AmountPaid
			if paid < 0 {
				paid = 0
			}
		}
	}
	remaining := inv.Amount - paid
	if newAmount > remaining+1e-4 {
		return errors.New("payment exceeds invoice outstanding balance")
	}
	return nil
}

func (s *PaymentService) recalcInvoices(newInv *uuid.UUID, oldInv *uuid.UUID) error {
	ids := make(map[uuid.UUID]struct{})
	if newInv != nil {
		ids[*newInv] = struct{}{}
	}
	if oldInv != nil {
		ids[*oldInv] = struct{}{}
	}
	for id := range ids {
		if err := s.invoiceSvc.RecalculateInvoice(id); err != nil {
			return err
		}
	}
	return nil
}

func (s *PaymentService) List(limit, offset int) ([]models.Payment, error) {
	return s.repo.List(limit, offset)
}

func (s *PaymentService) GetByID(id uuid.UUID) (*models.Payment, error) {
	return s.repo.GetByID(id)
}

func (s *PaymentService) Update(p *models.Payment) error {
	if p.AmountPaid < 0 {
		return errors.New("invalid amount")
	}
	if !validPaymentType(p.PaymentType) {
		return errors.New("payment_type must be training, project, or consulting")
	}
	if p.Currency == "" {
		p.Currency = "USD"
	}
	if p.PaymentMethod == "" {
		p.PaymentMethod = models.PaymentMethodBank
	}
	if !validPaymentMethod(p.PaymentMethod) {
		return errors.New("payment_method must be cash, bank, or mobile")
	}
	if p.PaymentDate.IsZero() {
		p.PaymentDate = time.Now()
	}
	if p.ReferenceNumber == nil && p.Reference != nil {
		p.ReferenceNumber = p.Reference
	}

	existing, err := s.repo.GetByID(p.ID)
	if err != nil {
		return err
	}
	oldInv := existing.InvoiceID

	if p.InvoiceID != nil {
		if err := s.validateAgainstInvoice(*p.InvoiceID, p.AmountPaid, p.ID); err != nil {
			return err
		}
	}

	if err := s.repo.Update(p); err != nil {
		return err
	}
	return s.recalcInvoices(p.InvoiceID, oldInv)
}

func (s *PaymentService) Delete(id uuid.UUID) error {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	invID := existing.InvoiceID
	if err := s.repo.Delete(id); err != nil {
		return err
	}
	if invID != nil {
		return s.invoiceSvc.RecalculateInvoice(*invID)
	}
	return nil
}
