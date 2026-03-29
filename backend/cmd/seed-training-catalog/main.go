package main

import (
	"fmt"
	"log"
	"os"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/database"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/seed"
	gormlogger "gorm.io/gorm/logger"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.Connect(cfg.PostgresDSN(), gormlogger.Warn)
	if err != nil {
		log.Fatal(err)
	}

	if err := database.AutoMigrate(db, &models.Academy{}, &models.Training{}); err != nil {
		log.Fatal("automigrate: ", err)
	}

	nA, nT, err := seed.SeedStaticCatalog(db)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Fprintf(os.Stdout, "static training catalog: created %d new academies, %d new trainings (existing slugs skipped)\n", nA, nT)
}
