package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	gormlogger "gorm.io/gorm/logger"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/database"
	"github.com/bararug/website-backend/internal/handlers"
	"github.com/bararug/website-backend/internal/middleware"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/permissions"
	"github.com/bararug/website-backend/internal/repositories"
	"github.com/bararug/website-backend/internal/services"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	if err := cfg.Validate(); err != nil {
		log.Fatal(err)
	}

	gin.SetMode(cfg.GinMode)

	logMode := gormlogger.Warn
	if cfg.Environment == "development" {
		logMode = gormlogger.Info
	}

	db, err := database.Connect(cfg.PostgresDSN(), logMode)
	if err != nil {
		if strings.Contains(err.Error(), "connection refused") {
			log.Printf("database: %v", err)
			log.Fatal("hint: start PostgreSQL first — from backend/ run: docker compose up -d   (or: make db-up)")
		}
		log.Fatal(err)
	}

	if err := database.AutoMigrate(
		db,
		&models.User{},
		&models.NewsCategory{},
		&models.News{},
		&models.Publication{},
		&models.Academy{},
		&models.Training{},
		&models.Application{},
		&models.Client{},
		&models.Partner{},
		&models.Project{},
		&models.Invoice{},
		&models.Payment{},
		&models.Expense{},
		&models.Certificate{},
		&models.UserPermission{},
		&models.FreeTrainingProgram{},
		&models.FreeTrainingRegistration{},
	); err != nil {
		log.Fatal("automigrate: ", err)
	}
	if err := database.EnsureBootstrapAdmins(db, cfg.BootstrapAdmins); err != nil {
		log.Fatal("bootstrap admins: ", err)
	}
	// Backfill payment_date for legacy rows (zero/epoch timestamps).
	if err := db.Exec(`UPDATE payments SET payment_date = created_at WHERE payment_date IS NULL OR payment_date < '1971-01-01'`).Error; err != nil {
		log.Printf("warn: payment_date backfill: %v", err)
	}

	// Repositories
	authRepo := repositories.NewAuthRepository(db)
	newsRepo := repositories.NewNewsRepository(db)
	newsCatRepo := repositories.NewNewsCategoryRepository(db)
	pubRepo := repositories.NewPublicationRepository(db)
	acadRepo := repositories.NewAcademyRepository(db)
	trainRepo := repositories.NewTrainingRepository(db)
	appRepo := repositories.NewApplicationRepository(db)
	payRepo := repositories.NewPaymentRepository(db)
	expRepo := repositories.NewExpenseRepository(db)
	clientRepo := repositories.NewClientRepository(db)
	partnerRepo := repositories.NewPartnerRepository(db)
	projRepo := repositories.NewProjectRepository(db)
	invRepo := repositories.NewInvoiceRepository(db)
	certRepo := repositories.NewCertificateRepository(db)
	freeTrainRepo := repositories.NewFreeTrainingRepository(db)

	// Services
	authSvc := services.NewAuthService(authRepo, cfg)
	newsSvc := services.NewNewsService(newsRepo, newsCatRepo)
	newsCatSvc := services.NewNewsCategoryService(newsCatRepo)
	pubSvc := services.NewPublicationService(pubRepo)
	acadSvc := services.NewAcademyService(acadRepo)
	trainSvc := services.NewTrainingService(trainRepo)
	appSvc := services.NewApplicationService(trainRepo, appRepo, cfg)
	invoiceSvc := services.NewInvoiceService(invRepo, payRepo, clientRepo, trainRepo, projRepo, cfg.InvoiceLogoURL, cfg.InvoiceCompanyAddress)
	paySvc := services.NewPaymentService(payRepo, invRepo, invoiceSvc)
	expSvc := services.NewExpenseService(expRepo)
	clientSvc := services.NewClientService(clientRepo)
	partnerSvc := services.NewPartnerService(partnerRepo)
	projSvc := services.NewProjectService(projRepo, expRepo)
	finReportSvc := services.NewFinancialReportService(db, invRepo)
	certRegSvc := services.NewCertificateRegistryService(certRepo, appRepo, freeTrainRepo, cfg)
	adminUsersSvc := services.NewAdminUsersService(authRepo)
	freeTrainSvc := services.NewFreeTrainingService(freeTrainRepo)

	// Handlers
	authH := handlers.NewAuthHandler(authSvc)
	newsH := handlers.NewNewsHandler(newsSvc)
	newsCatH := handlers.NewNewsCategoryHandler(newsCatSvc)
	pubH := handlers.NewPublicationHandler(pubSvc)
	acadH := handlers.NewAcademyHandler(acadSvc)
	trainH := handlers.NewTrainingHandler(trainSvc)
	appH := handlers.NewApplicationHandler(appSvc, cfg)
	payH := handlers.NewPaymentHandler(paySvc)
	expH := handlers.NewExpenseHandler(expSvc)
	clientH := handlers.NewClientHandler(clientSvc)
	partnerH := handlers.NewPartnerHandler(partnerSvc)
	projH := handlers.NewProjectHandler(projSvc)
	invH := handlers.NewInvoiceHandler(invoiceSvc)
	finReportH := handlers.NewFinancialReportHandler(finReportSvc)
	certH := handlers.NewCertificateHandler(appRepo, freeTrainSvc, cfg)
	certRegH := handlers.NewCertificateRegistryHandler(certRegSvc)
	adminUsersH := handlers.NewAdminUsersHandler(adminUsersSvc)
	freeTrainH := handlers.NewFreeTrainingHandler(freeTrainSvc, cfg)

	dash := func(p string) gin.HandlerFunc {
		return middleware.AuthDashboard(cfg.JWTSecret, cfg.DashboardWriteKey, authRepo, p)
	}
	adminOnly := middleware.AuthAdminOrKey(cfg.JWTSecret, cfg.DashboardWriteKey)

	r := gin.New()
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Dashboard-Key"},
		AllowCredentials: false,
	}))
	r.Use(middleware.Logger())
	r.Use(gin.Recovery())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"success": true, "data": gin.H{"status": "ok"}})
	})

	api := r.Group("/api")
	{
		api.POST("/auth/register", authH.Register)
		api.POST("/auth/login", authH.Login)

		api.GET("/admin/users", adminOnly, adminUsersH.List)
		api.POST("/admin/users", adminOnly, adminUsersH.Create)
		api.PATCH("/admin/users/:id", adminOnly, adminUsersH.Update)
		api.DELETE("/admin/users/:id", adminOnly, adminUsersH.Delete)

		api.GET("/news/categories", newsCatH.List)
		api.POST("/news/categories", dash(permissions.News), newsCatH.Create)
		api.GET("/news/:id", newsH.Get)
		api.PATCH("/news/:id", dash(permissions.News), newsH.Update)
		api.DELETE("/news/:id", dash(permissions.News), newsH.Delete)
		api.GET("/news", newsH.List)
		api.POST("/news", dash(permissions.News), newsH.Create)

		api.GET("/publications/:id", pubH.Get)
		api.GET("/publications", pubH.List)
		api.POST("/publications", dash(permissions.Publications), pubH.Create)
		api.PATCH("/publications/:id", dash(permissions.Publications), pubH.Update)
		api.DELETE("/publications/:id", dash(permissions.Publications), pubH.Delete)

		api.GET("/academies/catalog", acadH.ListWithTrainings)
		api.GET("/academies", acadH.List)
		api.GET("/academies/:id", acadH.Get)
		api.POST("/academies", dash(permissions.Trainings), acadH.Create)
		api.PATCH("/academies/:id", dash(permissions.Trainings), acadH.Update)
		api.DELETE("/academies/:id", dash(permissions.Trainings), acadH.Delete)

		api.POST("/certificates/issue", certH.Issue)
		api.POST("/certificates/issue-by-phone", certH.IssueByPhone)

		api.POST("/approve-student", dash(permissions.Applications), certRegH.ApproveStudent)
		api.GET("/certificate/:certificateNo/download", certRegH.DownloadCertificate)
		api.GET("/certificate/:certificateNo", certRegH.GetCertificate)
		api.POST("/trainings/apply", appH.Apply)

		api.GET("/free-training-programs/public", freeTrainH.PublicListActive)
		api.GET("/free-training-programs/public/slug/:slug", freeTrainH.PublicGetBySlug)
		api.POST("/free-training-programs/public/slug/:slug/register", freeTrainH.PublicRegister)
		api.POST("/free-training-programs/public/slug/:slug/certificate", freeTrainH.PublicIssueCertificate)
		api.GET("/free-training-programs", dash(permissions.Trainings), freeTrainH.AdminListPrograms)
		api.POST("/free-training-programs", dash(permissions.Trainings), freeTrainH.AdminCreateProgram)
		api.GET("/free-training-programs/:id", dash(permissions.Trainings), freeTrainH.AdminGetProgram)
		api.PATCH("/free-training-programs/:id", dash(permissions.Trainings), freeTrainH.AdminUpdateProgram)
		api.DELETE("/free-training-programs/:id", dash(permissions.Trainings), freeTrainH.AdminDeleteProgram)
		api.GET("/free-training-registrations", dash(permissions.Trainings), freeTrainH.AdminListRegistrations)
		api.PATCH("/free-training-registrations/:id", dash(permissions.Trainings), freeTrainH.AdminPatchRegistration)
		api.DELETE("/free-training-registrations/:id", dash(permissions.Trainings), freeTrainH.AdminDeleteRegistration)
		api.GET("/trainings", trainH.List)
		api.GET("/trainings/:id", trainH.Get)
		api.POST("/trainings", dash(permissions.Trainings), trainH.Create)
		api.PATCH("/trainings/:id", dash(permissions.Trainings), trainH.Update)
		api.DELETE("/trainings/:id", dash(permissions.Trainings), trainH.Delete)
		api.GET("/applications", appH.List)
		api.POST("/applications", dash(permissions.Applications), appH.Create)
		api.GET("/applications/:id", appH.Get)
		api.PATCH("/applications/:id", dash(permissions.Applications), appH.Update)
		api.DELETE("/applications/:id", dash(permissions.Applications), appH.Delete)

		api.GET("/projects", projH.List)
		api.GET("/projects/:id", projH.Get)
		api.POST("/projects", dash(permissions.Projects), projH.Create)
		api.PATCH("/projects/:id", dash(permissions.Projects), projH.Update)
		api.DELETE("/projects/:id", dash(permissions.Projects), projH.Delete)

		api.GET("/invoices", invH.List)
		api.GET("/invoices/:id/pdf", dash(permissions.Invoices), invH.PDF)
		api.GET("/invoices/:id", invH.Get)
		api.POST("/invoices", dash(permissions.Invoices), invH.Create)
		api.PATCH("/invoices/:id", dash(permissions.Invoices), invH.Update)
		api.DELETE("/invoices/:id", dash(permissions.Invoices), invH.Delete)

		api.GET("/financial/reports/summary", dash(permissions.FinancialReports), finReportH.Summary)

		api.GET("/payments", payH.List)
		api.GET("/payments/:id", payH.Get)
		api.POST("/payments", dash(permissions.Payments), payH.Create)
		api.PATCH("/payments/:id", dash(permissions.Payments), payH.Update)
		api.DELETE("/payments/:id", dash(permissions.Payments), payH.Delete)

		api.GET("/expenses", expH.List)
		api.GET("/expenses/:id", expH.Get)
		api.POST("/expenses", dash(permissions.Expenses), expH.Create)
		api.PATCH("/expenses/:id", dash(permissions.Expenses), expH.Update)
		api.DELETE("/expenses/:id", dash(permissions.Expenses), expH.Delete)

		api.GET("/clients", clientH.List)
		api.GET("/clients/:id", clientH.Get)
		api.POST("/clients", dash(permissions.Clients), clientH.Create)
		api.PATCH("/clients/:id", dash(permissions.Clients), clientH.Update)
		api.DELETE("/clients/:id", dash(permissions.Clients), clientH.Delete)

		api.GET("/partners", partnerH.List)
		api.GET("/partners/:id", partnerH.Get)
		api.POST("/partners", dash(permissions.Partners), partnerH.Create)
		api.PATCH("/partners/:id", dash(permissions.Partners), partnerH.Update)
		api.DELETE("/partners/:id", dash(permissions.Partners), partnerH.Delete)
	}

	addr := ":" + cfg.HTTPPort
	fmt.Fprintf(os.Stdout, "listening on %s\n", addr)
	if err := r.Run(addr); err != nil {
		log.Fatal(err)
	}
}
