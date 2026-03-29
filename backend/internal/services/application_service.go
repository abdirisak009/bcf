package services

import (
	"encoding/json"
	"errors"
	"strings"

	"github.com/google/uuid"
	"gorm.io/datatypes"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/models"
	"github.com/bararug/website-backend/internal/notify"
	"github.com/bararug/website-backend/internal/repositories"
)

var ErrTrainingNotFound = errors.New("training not found")

type ApplicationService struct {
	train *repositories.TrainingRepository
	app   *repositories.ApplicationRepository
	cfg   *config.Config
}

func NewApplicationService(train *repositories.TrainingRepository, app *repositories.ApplicationRepository, cfg *config.Config) *ApplicationService {
	return &ApplicationService{train: train, app: app, cfg: cfg}
}

func ptrEmpty(p *string) bool {
	if p == nil {
		return true
	}
	return strings.TrimSpace(*p) == ""
}

func participantRolesLen(j datatypes.JSON) int {
	if len(j) == 0 {
		return 0
	}
	var s []string
	if err := json.Unmarshal(j, &s); err != nil {
		return 0
	}
	return len(s)
}

func validateApplication(a *models.Application) error {
	a.ApplicantType = strings.TrimSpace(strings.ToLower(a.ApplicantType))
	if a.ApplicantType == "" {
		a.ApplicantType = "individual"
	}
	switch a.ApplicantType {
	case "individual":
		if ptrEmpty(a.FirstName) {
			return errors.New("first_name is required")
		}
		if ptrEmpty(a.LastName) {
			return errors.New("last_name is required")
		}
		if ptrEmpty(a.Phone) {
			return errors.New("whatsapp number is required")
		}
		if ptrEmpty(a.Company) {
			return errors.New("organization name is required")
		}
	case "organization":
		if ptrEmpty(a.Phone) {
			return errors.New("whatsapp number is required")
		}
		if ptrEmpty(a.Company) {
			return errors.New("organization name is required")
		}
		band := ""
		if a.EmployeeCountBand != nil {
			band = strings.TrimSpace(*a.EmployeeCountBand)
		}
		valid := map[string]bool{"1_10": true, "11_50": true, "51_200": true, "200_plus": true, "custom": true}
		if !valid[band] {
			return errors.New("number of participants range is required")
		}
		if band == "custom" && ptrEmpty(a.EmployeeCountCustom) {
			return errors.New("please specify number of participants")
		}
		if participantRolesLen(a.ParticipantRoles) < 1 {
			return errors.New("select at least one participant role")
		}
		tf := ""
		if a.TrainingFormat != nil {
			tf = strings.TrimSpace(*a.TrainingFormat)
		}
		validF := map[string]bool{"online": true, "in_person": true, "hybrid": true}
		if !validF[tf] {
			return errors.New("preferred training format is required")
		}
	default:
		return errors.New("applicant_type must be individual or organization")
	}
	return nil
}

func (s *ApplicationService) applyInternal(a *models.Application, strict bool) error {
	a.Email = strings.TrimSpace(strings.ToLower(a.Email))
	if strings.TrimSpace(a.Status) == "" {
		a.Status = "pending"
	}
	if a.TrainingID == uuid.Nil || a.Email == "" {
		return errors.New("training_id and email are required")
	}
	if strings.TrimSpace(a.ApplicantType) == "" {
		a.ApplicantType = "individual"
	}
	if strict {
		if err := validateApplication(a); err != nil {
			return err
		}
	}
	t, err := s.train.GetByID(a.TrainingID)
	if err != nil {
		return err
	}
	if t == nil {
		return ErrTrainingNotFound
	}
	if err := s.app.Create(a); err != nil {
		return err
	}
	notify.TrainingApplicationSubmitted(s.cfg, a, t)
	return nil
}

// Apply validates individual vs organization rules (public training application form).
func (s *ApplicationService) Apply(a *models.Application) error {
	return s.applyInternal(a, true)
}

// ApplyDashboardCreate stores an application from the admin dashboard (relaxed validation).
func (s *ApplicationService) ApplyDashboardCreate(a *models.Application) error {
	return s.applyInternal(a, false)
}

func (s *ApplicationService) List(limit, offset int) ([]models.Application, error) {
	return s.app.List(limit, offset)
}

func (s *ApplicationService) GetByID(id uuid.UUID) (*models.Application, error) {
	return s.app.GetByID(id)
}

func (s *ApplicationService) Update(a *models.Application) error {
	a.Email = strings.TrimSpace(strings.ToLower(a.Email))
	if a.Email == "" {
		return errors.New("email is required")
	}
	if a.Status == "" {
		a.Status = "pending"
	}
	a.Training = nil
	return s.app.Update(a)
}

func (s *ApplicationService) Delete(id uuid.UUID) error {
	return s.app.Delete(id)
}
