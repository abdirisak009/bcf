package repositories

import (
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/models"
)

type CertificateRepository struct {
	db *gorm.DB
}

func NewCertificateRepository(db *gorm.DB) *CertificateRepository {
	return &CertificateRepository{db: db}
}

func (r *CertificateRepository) GetByCertificateNo(no string) (*models.Certificate, error) {
	var c models.Certificate
	err := r.db.Where("certificate_no = ?", no).First(&c).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// CreateWithNumber allocates the next BCF-YYYY-NNNN inside a transaction (PostgreSQL advisory lock per year).
func (r *CertificateRepository) CreateWithNumber(c *models.Certificate) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		year := time.Now().UTC().Year()
		if err := tx.Exec("SELECT pg_advisory_xact_lock(hashtext(?))", fmt.Sprintf("bcf_cert_%d", year)).Error; err != nil {
			return err
		}
		var maxSeq int
		if err := tx.Model(&models.Certificate{}).Where("year = ?", year).Select("COALESCE(MAX(seq), 0)").Scan(&maxSeq).Error; err != nil {
			return err
		}
		c.Year = year
		c.Seq = maxSeq + 1
		c.CertificateNo = fmt.Sprintf("BCF-%d-%04d", year, c.Seq)
		if err := tx.Create(c).Error; err != nil {
			return err
		}
		return nil
	})
}

var ErrCertificateNotFound = errors.New("certificate not found")

func (r *CertificateRepository) MustGetByCertificateNo(no string) (*models.Certificate, error) {
	c, err := r.GetByCertificateNo(no)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCertificateNotFound
		}
		return nil, err
	}
	return c, nil
}
