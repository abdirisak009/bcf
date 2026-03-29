package services

import (
	"fmt"
	"time"

	"gorm.io/gorm"

	"github.com/bararug/website-backend/internal/repositories"
)

// FinancialReportSummary is returned by GET /api/financial/reports/summary.
type FinancialReportSummary struct {
	Period struct {
		From string `json:"from"`
		To   string `json:"to"`
	} `json:"period"`
	ProfitLoss struct {
		Revenue  float64 `json:"revenue"`
		Expenses float64 `json:"expenses"`
		Net      float64 `json:"net"`
	} `json:"profit_loss"`
	RevenueByType      map[string]float64 `json:"revenue_by_type"`
	ExpensesByCategory map[string]float64 `json:"expenses_by_category"`
	CashFlow           struct {
		Incoming float64 `json:"incoming"`
		Outgoing float64 `json:"outgoing"`
		Net      float64 `json:"net"`
	} `json:"cash_flow"`
	PendingInvoices struct {
		Count  int64   `json:"count"`
		Amount float64 `json:"amount"`
	} `json:"pending_invoices"`
	Series []MonthlySeriesPoint `json:"series"`
}

// MonthlySeriesPoint is incoming/outgoing per calendar month in range.
type MonthlySeriesPoint struct {
	Period   string  `json:"period"`
	Incoming float64 `json:"incoming"`
	Outgoing float64 `json:"outgoing"`
}

type FinancialReportService struct {
	db      *gorm.DB
	invRepo *repositories.InvoiceRepository
}

func NewFinancialReportService(db *gorm.DB, invRepo *repositories.InvoiceRepository) *FinancialReportService {
	return &FinancialReportService{db: db, invRepo: invRepo}
}

// Summary aggregates payments and expenses in [from, to] (date boundaries, UTC).
func (s *FinancialReportService) Summary(from, to time.Time) (*FinancialReportSummary, error) {
	from = dayStartUTC(from)
	to = dayEndUTC(to)
	out := &FinancialReportSummary{}
	out.Period.From = from.Format("2006-01-02")
	out.Period.To = to.Format("2006-01-02")

	var revenue float64
	if err := s.db.Raw(`
		SELECT COALESCE(SUM(amount), 0)
		FROM payments
		WHERE payment_date >= ? AND payment_date <= ?
	`, from, to).Scan(&revenue).Error; err != nil {
		return nil, err
	}

	var expenseTotal float64
	if err := s.db.Raw(`
		SELECT COALESCE(SUM(amount), 0)
		FROM expenses
		WHERE COALESCE(expense_date::timestamp, created_at) >= ? AND COALESCE(expense_date::timestamp, created_at) <= ?
	`, from, to).Scan(&expenseTotal).Error; err != nil {
		return nil, err
	}

	out.ProfitLoss.Revenue = revenue
	out.ProfitLoss.Expenses = expenseTotal
	out.ProfitLoss.Net = revenue - expenseTotal

	out.CashFlow.Incoming = revenue
	out.CashFlow.Outgoing = expenseTotal
	out.CashFlow.Net = revenue - expenseTotal

	rows := []struct {
		PaymentType string  `gorm:"column:payment_type"`
		Total       float64 `gorm:"column:total"`
	}{}
	if err := s.db.Raw(`
		SELECT payment_type, COALESCE(SUM(amount), 0) AS total
		FROM payments
		WHERE payment_date >= ? AND payment_date <= ?
		GROUP BY payment_type
	`, from, to).Scan(&rows).Error; err != nil {
		return nil, err
	}
	out.RevenueByType = map[string]float64{}
	for _, r := range rows {
		out.RevenueByType[r.PaymentType] = r.Total
	}

	erows := []struct {
		Category string  `gorm:"column:category"`
		Total    float64 `gorm:"column:total"`
	}{}
	if err := s.db.Raw(`
		SELECT category, COALESCE(SUM(amount), 0) AS total
		FROM expenses
		WHERE COALESCE(expense_date::timestamp, created_at) >= ? AND COALESCE(expense_date::timestamp, created_at) <= ?
		GROUP BY category
	`, from, to).Scan(&erows).Error; err != nil {
		return nil, err
	}
	out.ExpensesByCategory = map[string]float64{}
	for _, r := range erows {
		out.ExpensesByCategory[r.Category] = r.Total
	}

	c, sum, err := s.invRepo.CountPending()
	if err != nil {
		return nil, err
	}
	out.PendingInvoices.Count = c
	out.PendingInvoices.Amount = sum

	series, err := s.monthlySeries(from, to)
	if err != nil {
		return nil, err
	}
	out.Series = series

	return out, nil
}

func (s *FinancialReportService) monthlySeries(from, to time.Time) ([]MonthlySeriesPoint, error) {
	var pts []MonthlySeriesPoint
	cur := time.Date(from.Year(), from.Month(), 1, 0, 0, 0, 0, time.UTC)
	endMonth := time.Date(to.Year(), to.Month(), 1, 0, 0, 0, 0, time.UTC)
	for !cur.After(endMonth) {
		next := cur.AddDate(0, 1, 0)
		mStart := cur
		mEnd := next.Add(-time.Nanosecond)
		if mStart.Before(from) {
			mStart = from
		}
		if mEnd.After(to) {
			mEnd = to
		}
		var incoming, outgoing float64
		if err := s.db.Raw(`
			SELECT COALESCE(SUM(amount), 0) FROM payments
			WHERE payment_date >= ? AND payment_date <= ?
		`, mStart, mEnd).Scan(&incoming).Error; err != nil {
			return nil, err
		}
		if err := s.db.Raw(`
			SELECT COALESCE(SUM(amount), 0) FROM expenses
			WHERE COALESCE(expense_date::timestamp, created_at) >= ? AND COALESCE(expense_date::timestamp, created_at) <= ?
		`, mStart, mEnd).Scan(&outgoing).Error; err != nil {
			return nil, err
		}
		pts = append(pts, MonthlySeriesPoint{
			Period:   cur.Format("2006-01"),
			Incoming: incoming,
			Outgoing: outgoing,
		})
		cur = next
	}
	return pts, nil
}

func dayStartUTC(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
}

func dayEndUTC(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, 999999999, time.UTC)
}

// ParseReportDates parses YYYY-MM-DD query params; default last 90 days.
func ParseReportDates(fromStr, toStr string) (time.Time, time.Time, error) {
	now := time.Now().UTC()
	to := dayEndUTC(now)
	from := dayStartUTC(now.AddDate(0, 0, -90))
	var err error
	if toStr != "" {
		to, err = time.Parse("2006-01-02", toStr)
		if err != nil {
			return from, to, fmt.Errorf("invalid to date")
		}
		to = dayEndUTC(to)
	}
	if fromStr != "" {
		from, err = time.Parse("2006-01-02", fromStr)
		if err != nil {
			return from, to, fmt.Errorf("invalid from date")
		}
		from = dayStartUTC(from)
	}
	if from.After(to) {
		return from, to, fmt.Errorf("from must be before or equal to to")
	}
	return from, to, nil
}
