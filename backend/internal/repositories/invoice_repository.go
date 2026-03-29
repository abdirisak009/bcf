package repositories

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type InvoiceRepository struct {
	db *gorm.DB
}

func NewInvoiceRepository(db *gorm.DB) *InvoiceRepository {
	return &InvoiceRepository{db: db}
}

func (r *InvoiceRepository) Create(inv *models.Invoice) error {
	return r.db.Create(inv).Error
}

func (r *InvoiceRepository) List(limit, offset int, status, clientID string) ([]models.Invoice, error) {
	q := r.db.Model(&models.Invoice{}).Preload("Client").Preload("Project").Preload("Training")
	if status != "" {
		q = q.Where("status = ?", status)
	}
	if clientID != "" {
		if id, err := uuid.Parse(clientID); err == nil {
			q = q.Where("client_id = ?", id)
		}
	}
	var rows []models.Invoice
	err := q.Order("issue_date DESC, created_at DESC").Limit(limit).Offset(offset).Find(&rows).Error
	return rows, err
}

func (r *InvoiceRepository) GetByID(id uuid.UUID) (*models.Invoice, error) {
	var inv models.Invoice
	err := r.db.Preload("Client").Preload("Project").Preload("Training").First(&inv, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (r *InvoiceRepository) Update(inv *models.Invoice) error {
	return r.db.Save(inv).Error
}

func (r *InvoiceRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Invoice{}, "id = ?", id).Error
}

// CreateWithNumber assigns invoice_year, invoice_seq, and invoice_number inside a transaction.
func (r *InvoiceRepository) CreateWithNumber(inv *models.Invoice) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		year := inv.IssueDate.Year()
		if year < 2000 {
			year = time.Now().Year()
		}
		seq, err := r.nextInvoiceSeqTx(tx, year)
		if err != nil {
			return err
		}
		inv.InvoiceYear = year
		inv.InvoiceSeq = seq
		inv.InvoiceNumber = fmt.Sprintf("INV-%d-%05d", year, seq)
		return tx.Create(inv).Error
	})
}

func (r *InvoiceRepository) nextInvoiceSeqTx(tx *gorm.DB, year int) (int, error) {
	var maxSeq int
	err := tx.Model(&models.Invoice{}).
		Where("invoice_year = ?", year).
		Select("COALESCE(MAX(invoice_seq), 0)").
		Scan(&maxSeq).Error
	if err != nil {
		return 0, err
	}
	return maxSeq + 1, nil
}

func (r *InvoiceRepository) UpdateStatus(id uuid.UUID, status string) error {
	return r.db.Model(&models.Invoice{}).Where("id = ?", id).Update("status", status).Error
}

// CountPending returns invoices with status unpaid, partial, or overdue.
func (r *InvoiceRepository) CountPending() (int64, float64, error) {
	var count int64
	var sum float64
	err := r.db.Model(&models.Invoice{}).
		Where("status IN ?", []string{models.InvoiceStatusUnpaid, models.InvoiceStatusPartial, models.InvoiceStatusOverdue}).
		Count(&count).Error
	if err != nil {
		return 0, 0, err
	}
	err = r.db.Model(&models.Invoice{}).
		Where("status IN ?", []string{models.InvoiceStatusUnpaid, models.InvoiceStatusPartial, models.InvoiceStatusOverdue}).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&sum).Error
	return count, sum, err
}
