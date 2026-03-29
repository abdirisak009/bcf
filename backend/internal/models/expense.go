package models

import (
	"time"

	"github.com/google/uuid"
)

const (
	ExpenseCategorySalary    = "salary"
	ExpenseCategoryTransport = "transport"
	ExpenseCategoryOffice    = "office"
	ExpenseCategoryMarketing = "marketing"
	ExpenseCategoryOther     = "other"
)

type Expense struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Amount      float64    `gorm:"not null" json:"amount"`
	Currency    string     `gorm:"size:10;not null;default:USD" json:"currency"`
	Description *string    `gorm:"type:text" json:"description,omitempty"`
	Category    string     `gorm:"size:64;not null;default:office;index" json:"category"`
	ProjectID   *uuid.UUID `gorm:"type:uuid;index" json:"project_id,omitempty"`
	ReceiptURL  *string    `gorm:"type:text" json:"receipt_url,omitempty"`
	ExpenseDate *time.Time `gorm:"type:date" json:"expense_date,omitempty"`
	CreatedBy   *uuid.UUID `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (Expense) TableName() string { return "expenses" }
