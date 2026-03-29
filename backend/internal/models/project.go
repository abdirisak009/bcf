package models

import (
	"time"

	"github.com/google/uuid"
)

// Project status values (stored lowercase).
const (
	ProjectStatusPlanning  = "planning"
	ProjectStatusActive    = "active"
	ProjectStatusOnHold    = "on_hold"
	ProjectStatusCompleted = "completed"
	ProjectStatusCancelled = "cancelled"
)

// Project is a consulting engagement used for invoices and expense allocation.
type Project struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ClientID         *uuid.UUID `gorm:"type:uuid;index" json:"client_id,omitempty"`
	Name             string     `gorm:"size:255;not null" json:"name"`
	Description      *string    `gorm:"type:text" json:"description,omitempty"`
	ContractValue    *float64   `gorm:"type:numeric(15,2)" json:"contract_value,omitempty"`
	ContractCurrency string     `gorm:"size:10;default:USD" json:"contract_currency,omitempty"`
	ContractStart    *string    `gorm:"size:12" json:"contract_start,omitempty"` // YYYY-MM-DD
	ContractEnd      *string    `gorm:"size:12" json:"contract_end,omitempty"`   // YYYY-MM-DD
	Status           string     `gorm:"size:32;default:active;index" json:"status,omitempty"`
	MilestonePct     *float64   `gorm:"type:numeric(5,2)" json:"milestone_pct,omitempty"` // 0–100
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`

	// Computed for API (not stored): sum of expenses linked to this project; balance = contract_value − expense_total.
	ExpenseTotal *float64 `gorm:"-" json:"expense_total,omitempty"`
	Balance      *float64 `gorm:"-" json:"balance,omitempty"`
}

func (Project) TableName() string { return "projects" }
