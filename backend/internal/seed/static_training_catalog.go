package seed

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/bararug/website-backend/internal/models"
	"gorm.io/gorm"
)

type catalogCourse struct {
	Code    string
	Title   string
	Summary string
	Dur     string
	Format  string
	Level   string
}

type catalogAcademy struct {
	Key         string // stable id e.g. business
	Name        string
	Description string
	SortOrder   int
	Courses     []catalogCourse
}

// StaticCatalog mirrors lib/training-catalogue-data.ts (academies + courses).
var staticCatalog = []catalogAcademy{
	{
		Key:         "business",
		Name:        "Business Academy",
		Description: "Prepares professionals and organizations to navigate competitive markets, drive innovation, and build resilient operations. Programs span strategic planning, transformation, process improvement, supply chain management, and entrepreneurship.",
		SortOrder:   10,
		Courses: []catalogCourse{
			{"1.1", "Strategic Business Planning and Execution", "Strategic planning competencies to set direction, allocate resources, and drive execution—environment analysis, objectives, competitive strategy, execution, KPIs, and adaptive review.", "5 Days", "Workshop / In-person", "Intermediate – Advanced"},
			{"1.2", "Business Transformation and Innovation", "Frameworks for leading complex transformations, digital change, and innovation—drivers, digital architecture, agile experimentation, business model redesign, change management, and governance.", "5 Days", "Workshop / Blended", "Senior Managers & Executives"},
			{"1.3", "Business Process Improvement", "Identify inefficiencies, redesign workflows, and build continuous improvement cultures using Lean and Six Sigma—mapping, DMAIC, automation, productivity, and implementation roadmaps.", "4 Days", "Workshop / In-person", "Operations & Mid-Level Managers"},
			{"1.4", "Value Chain and Operations Management", "Value chain analysis and supply chain strategy—Porter’s value chain, inventory, procurement, logistics, cost management, risk, and performance metrics.", "4 Days", "Workshop / In-person", "Operations & Supply Chain Professionals"},
			{"1.5", "Entrepreneurship and Startup Management", "Launch and grow ventures—opportunity validation, business models, financing, scaling, risk, and exit strategies.", "5 Days", "Bootcamp", "Entrepreneurs & SME Leaders"},
		},
	},
	{
		Key:         "economics",
		Name:        "Economics Academy",
		Description: "Builds analytical capacity for evidence-based policy design, fiscal management, and economic governance for government economists, policy analysts, and development professionals.",
		SortOrder:   20,
		Courses: []catalogCourse{
			{"2.1", "Applied Economic Policy Analysis", "Design, analyze, and evaluate economic policies—institutional economics, data-driven policy, impact evaluation, cost-benefit, behavioral insights, and stakeholder communication.", "5 Days", "Workshop / In-person", "Policy Analysts & Economists"},
			{"2.2", "Public Sector Economics and Fiscal Management", "Government finance, revenue mobilization, tax policy, MTEF and program budgeting, fiscal risk and debt sustainability, expenditure efficiency, and fiscal reform.", "5 Days", "Workshop / In-person", "Public Finance Officials & Budget Directors"},
		},
	},
	{
		Key:         "finance",
		Name:        "Finance Academy",
		Description: "Professional finance education for financial managers, CFOs, analysts, and governance professionals—strategic financial management, analysis, risk, and oversight.",
		SortOrder:   30,
		Courses: []catalogCourse{
			{"3.1", "Strategic Financial Management", "Align financial strategy with objectives—value creation, capital structure, investment appraisal, risk management, governance, and strategic performance.", "5 Days", "Executive Workshop", "CFOs, Finance Directors & Senior Managers"},
			{"3.2", "Financial Analysis, Planning and Control", "Interpret financial statements, build models, forecasting and scenarios, and management control systems for executive decisions.", "4 Days", "Workshop / In-person", "Financial Analysts & Planning Professionals"},
		},
	},
	{
		Key:         "marketing",
		Name:        "Marketing & Sales Academy",
		Description: "Strategies and tools to build brands, engage customers, and drive revenue—from market analysis through acquisition, retention, and optimization.",
		SortOrder:   40,
		Courses: []catalogCourse{
			{"4.1", "Strategic Marketing Planning", "Market segmentation, brand positioning, marketing mix, budgeting, analytics, and campaign evaluation.", "5 Days", "Workshop / Blended", "Marketing Managers & Brand Strategists"},
			{"4.2", "Sales Management and Revenue Growth", "Sales funnel and pipeline, territories, forecasting, CRM, performance KPIs, and continuous improvement in sales organizations.", "4 Days", "Workshop / In-person", "Sales Managers & Revenue Leaders"},
		},
	},
	{
		Key:         "leadership",
		Name:        "Leadership Academy",
		Description: "Adaptive, transformational, and strategic leadership for government, private sector, and civil society—to inspire teams, drive change, and build resilient organizations.",
		SortOrder:   50,
		Courses: []catalogCourse{
			{"5.1", "Transformational Leadership", "BCF's flagship leadership program—vision and alignment, change leadership, motivation and trust, innovation culture, 360° impact, and organizational resilience.", "5 Days", "Executive Retreat / Workshop", "Senior Leaders & Executives"},
		},
	},
}

func academySlug(key string) string {
	return "static-catalog-academy-" + key
}

func courseSlug(academyKey, code string) string {
	return "static-catalog-course-" + academyKey + "-" + strings.ReplaceAll(code, ".", "-")
}

// SeedStaticCatalog inserts academies and trainings from the published catalogue when missing (idempotent by slug).
// Re-running does not duplicate rows.
func SeedStaticCatalog(db *gorm.DB) (academiesCreated, trainingsCreated int, err error) {
	emptyArr := json.RawMessage(`[]`)
	for _, a := range staticCatalog {
		slug := academySlug(a.Key)
		var ac models.Academy
		q := db.Where("slug = ?", slug).Limit(1)
		if err := q.First(&ac).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return academiesCreated, trainingsCreated, err
			}
			desc := a.Description
			s := slug
			ac = models.Academy{
				Name:        a.Name,
				Description: &desc,
				Slug:        &s,
				SortOrder:   a.SortOrder,
			}
			if err := db.Create(&ac).Error; err != nil {
				return academiesCreated, trainingsCreated, fmt.Errorf("academy %s: %w", a.Key, err)
			}
			academiesCreated++
		}

		for _, c := range a.Courses {
			ts := courseSlug(a.Key, c.Code)
			var n int64
			if err := db.Model(&models.Training{}).Where("slug = ?", ts).Count(&n).Error; err != nil {
				return academiesCreated, trainingsCreated, err
			}
			if n > 0 {
				continue
			}
			title := fmt.Sprintf("Course %s — %s", c.Code, c.Title)
			sum := c.Summary
			dur := c.Dur
			f := c.Format
			lv := c.Level
			aid := ac.ID
			tr := models.Training{
				AcademyID:   &aid,
				Title:       title,
				Description: &sum,
				Slug:        &ts,
				Duration:    &dur,
				Format:      &f,
				Level:       &lv,
				Curriculum:  emptyArr,
				Outcomes:    emptyArr,
			}
			if err := db.Create(&tr).Error; err != nil {
				return academiesCreated, trainingsCreated, fmt.Errorf("training %s: %w", ts, err)
			}
			trainingsCreated++
		}
	}
	return academiesCreated, trainingsCreated, nil
}
