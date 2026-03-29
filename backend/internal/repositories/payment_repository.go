package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type PaymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) Create(p *models.Payment) error {
	return r.db.Create(p).Error
}

func (r *PaymentRepository) List(limit, offset int) ([]models.Payment, error) {
	var rows []models.Payment
	err := r.db.Preload("Invoice").Order("payment_date DESC, created_at DESC").Limit(limit).Offset(offset).Find(&rows).Error
	return rows, err
}

// SumAmountForInvoice sums the legacy `amount` column for rows linked to an invoice.
func (r *PaymentRepository) SumAmountForInvoice(invoiceID uuid.UUID) (float64, error) {
	var sum float64
	err := r.db.Model(&models.Payment{}).
		Where("invoice_id = ?", invoiceID).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&sum).Error
	return sum, err
}

func (r *PaymentRepository) GetByID(id uuid.UUID) (*models.Payment, error) {
	var p models.Payment
	err := r.db.First(&p, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PaymentRepository) Update(p *models.Payment) error {
	return r.db.Save(p).Error
}

func (r *PaymentRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Payment{}, "id = ?", id).Error
}
