package models

import (
	"time"

	"github.com/google/uuid"
)

// Certificate is a persisted issued certificate (BCF-YYYY-NNNN) for download by certificate number.
type Certificate struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	StudentName     string     `gorm:"type:text;not null" json:"student_name"`
	TrainingName    string     `gorm:"type:text;not null" json:"training_name"`
	FromDate        time.Time  `gorm:"type:date;not null" json:"from_date"`
	ToDate          time.Time  `gorm:"type:date;not null" json:"to_date"`
	CertificateNo   string     `gorm:"size:32;uniqueIndex;not null" json:"certificate_no"`
	IssueDate       time.Time  `gorm:"type:date;not null" json:"issue_date"`
	Year            int        `gorm:"not null;uniqueIndex:cert_year_seq" json:"year"`
	Seq             int        `gorm:"not null;uniqueIndex:cert_year_seq" json:"seq"`
	ApplicationID   *uuid.UUID `gorm:"type:uuid;index" json:"application_id,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}

func (Certificate) TableName() string { return "certificates" }
