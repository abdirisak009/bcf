package database

import (
	"errors"
	"log"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/models"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
	"gorm.io/gorm"
)

// EnsureBootstrapAdmins creates admin users from config when their email is not yet in the database.
// Existing users are left unchanged (no password overwrite on restart).
func EnsureBootstrapAdmins(db *gorm.DB, admins []config.BootstrapAdmin) error {
	if len(admins) == 0 {
		return nil
	}
	for _, b := range admins {
		var existing models.User
		err := db.Where("email = ?", b.Email).First(&existing).Error
		if err == nil {
			log.Printf("bootstrap admin: skip (already exists) %s", b.Email)
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		hash, err := pkgutils.HashPassword(b.Password)
		if err != nil {
			return err
		}
		u := models.User{
			Email:        b.Email,
			PasswordHash: hash,
			Role:         models.RoleAdmin,
		}
		if err := db.Create(&u).Error; err != nil {
			return err
		}
		log.Printf("bootstrap admin: created %s", b.Email)
	}
	return nil
}
