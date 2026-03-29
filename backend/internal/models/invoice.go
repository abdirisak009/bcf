package models

import (
	"time"

	"github.com/google/uuid"
)

// Invoice status values (stored lowercase).
const (
	InvoiceStatusPaid    = "paid"
	InvoiceStatusUnpaid  = "unpaid"
	InvoiceStatusPartial = "partial"
	InvoiceStatusOverdue = "overdue"
)

// Invoice links revenue to a client and optionally a training or project.
type Invoice struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	InvoiceNumber  string     `gorm:"size:40;uniqueIndex;not null" json:"invoice_number"`
	InvoiceYear    int        `gorm:"not null;index:idx_invoice_year_seq,priority:1" json:"-"`
	InvoiceSeq     int        `gorm:"not null;index:idx_invoice_year_seq,priority:2" json:"-"`
	ClientID       uuid.UUID  `gorm:"type:uuid;index;not null" json:"client_id"`
	ProjectID      *uuid.UUID `gorm:"type:uuid;index" json:"project_id,omitempty"`
	TrainingID     *uuid.UUID `gorm:"type:uuid;index" json:"training_id,omitempty"`
	Amount         float64    `gorm:"not null" json:"amount"`
	Currency       string     `gorm:"size:10;not null;default:USD" json:"currency"`
	Status         string     `gorm:"size:20;not null;default:unpaid;index" json:"status"`
	IssueDate      time.Time  `gorm:"type:date;not null" json:"issue_date"`
	DueDate        time.Time  `gorm:"type:date;not null" json:"due_date"`
	Notes          *string    `gorm:"type:text" json:"notes,omitempty"`
	CreatedBy      *uuid.UUID `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	Client         *Client    `gorm:"foreignKey:ClientID" json:"client,omitempty"`
	Project        *Project   `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	Training       *Training  `gorm:"foreignKey:TrainingID" json:"training,omitempty"`
}

func (Invoice) TableName() string { return "invoices" }
