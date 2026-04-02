// Creates or updates one admin user (role=admin). Run from backend/: ADMIN_EMAIL=... ADMIN_PASSWORD=... go run ./cmd/seed-admin
package main

import (
	"errors"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/database"
	"github.com/bararug/website-backend/internal/models"
	pkgutils "github.com/bararug/website-backend/pkg/utils"
	gormlogger "gorm.io/gorm/logger"
	"gorm.io/gorm"
)

func main() {
	email := strings.ToLower(strings.TrimSpace(os.Getenv("ADMIN_EMAIL")))
	pass := strings.TrimSpace(os.Getenv("ADMIN_PASSWORD"))

	if email == "" || pass == "" {
		fmt.Fprintln(os.Stderr, "Usage: set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars), then:")
		fmt.Fprintln(os.Stderr, "  cd backend && ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='your-secure-pass' go run ./cmd/seed-admin")
		os.Exit(1)
	}
	if len(pass) < 8 {
		log.Fatal("ADMIN_PASSWORD must be at least 8 characters (same rule as registration)")
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.Connect(cfg.PostgresDSN(), gormlogger.Warn)
	if err != nil {
		log.Fatal(err)
	}

	if err := database.AutoMigrate(db, &models.User{}); err != nil {
		log.Fatal("automigrate: ", err)
	}

	hash, err := pkgutils.HashPassword(pass)
	if err != nil {
		log.Fatal(err)
	}

	var u models.User
	err = db.Where("email = ?", email).First(&u).Error
	if err == nil {
		u.PasswordHash = hash
		u.Role = models.RoleAdmin
		if err := db.Save(&u).Error; err != nil {
			log.Fatal("update admin: ", err)
		}
		fmt.Printf("Updated existing user to admin: %s\n", email)
		return
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		log.Fatal("lookup user: ", err)
	}

	u = models.User{
		Email:        email,
		PasswordHash: hash,
		Role:         models.RoleAdmin,
	}
	if err := db.Create(&u).Error; err != nil {
		log.Fatal("create admin: ", err)
	}
	fmt.Printf("Created admin user: %s\n", email)
}
