package permissions

// Dashboard permission keys (stored in user_permissions.key).
const (
	News               = "news"
	Publications       = "publications"
	Trainings          = "trainings"
	Applications       = "applications"
	Projects           = "projects"
	Invoices           = "invoices"
	FinancialReports   = "financial_reports"
	Payments           = "payments"
	Expenses           = "expenses"
	Clients            = "clients"
	Partners           = "partners"
)

// AllKeys returns every assignable permission (for admin UI).
func AllKeys() []string {
	return []string{
		News, Publications, Trainings, Applications, Projects,
		Invoices, FinancialReports, Payments, Expenses, Clients, Partners,
	}
}
