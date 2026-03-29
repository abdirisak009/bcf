package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

const (
	PaymentTypeTraining    = "training"
	PaymentTypeProject     = "project"
	PaymentTypeConsulting  = "consulting"
	PaymentMethodCash      = "cash"
	PaymentMethodBank      = "bank"
	PaymentMethodMobile    = "mobile"
)

// Payment records income; optionally linked to an invoice for partial settlement.
type Payment struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	AmountPaid float64  `gorm:"column:amount;not null" json:"amount_paid"`
	Currency  string    `gorm:"size:10;not null;default:USD" json:"currency"`

	// Legacy column "reference" — prefer ReferenceNumber for new data.
	Reference        *string `gorm:"size:255" json:"reference,omitempty"`
	ReferenceNumber  *string `gorm:"column:reference_number;size:255" json:"reference_number,omitempty"`
	PaymentType      string  `gorm:"size:50;not null" json:"payment_type"`
	PaymentMethod    string    `gorm:"size:24;not null;default:bank" json:"payment_method"`
	PaymentDate      time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"payment_date"`

	RelatedID *uuid.UUID      `gorm:"type:uuid" json:"related_id,omitempty"`
	ClientID  *uuid.UUID      `gorm:"type:uuid;index" json:"client_id,omitempty"`
	InvoiceID *uuid.UUID      `gorm:"type:uuid;index" json:"invoice_id,omitempty"`
	Invoice   *Invoice        `gorm:"foreignKey:InvoiceID" json:"invoice,omitempty"`

	Metadata  json.RawMessage `gorm:"type:jsonb" json:"metadata,omitempty"`
	CreatedBy *uuid.UUID      `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt time.Time       `json:"created_at"`
}

func (Payment) TableName() string { return "payments" }
