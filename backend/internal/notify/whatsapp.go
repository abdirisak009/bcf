package notify

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/bararug/website-backend/config"
	"github.com/bararug/website-backend/internal/models"
)

// TrainingApplicationSubmitted runs after a successful training application (public apply).
// If WHATSAPP_SENDTEXT_URL + WHATSAPP_SENDTEXT_API_KEY are set, sends a thank-you WhatsApp to the applicant
// (when phone is present) and optionally notifies the admin number (WHATSAPP_NOTIFY_TO).
// Otherwise falls back to legacy providers (webhook / callmebot / ultramsg) for admin only.
// FreeTrainingRegistrationSubmitted runs after a successful public free-training signup.
// When WHATSAPP_SENDTEXT_* is set: sends WhatsApp to the applicant (if phone present) and optional admin copy.
// Otherwise legacy providers notify admin only (same pattern as TrainingApplicationSubmitted).
func FreeTrainingRegistrationSubmitted(cfg *config.Config, reg *models.FreeTrainingRegistration, prog *models.FreeTrainingProgram) {
	if cfg == nil || reg == nil {
		return
	}
	title, venue := freeTrainingProgramLabels(prog)

	if sendTextConfigured(cfg) {
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 22*time.Second)
			defer cancel()
			applicantPhone := digitsOnly(reg.Phone)
			if applicantPhone != "" {
				msg := buildFreeTrainingThankYouMessage(reg, title, venue)
				if err := sendTextAPI(ctx, cfg, applicantPhone, msg); err != nil {
					log.Printf("whatsapp sendText (free training applicant register): %v", err)
				}
			}
			adminPhone := digitsOnly(cfg.WhatsAppNotifyTo)
			if adminPhone != "" {
				msg := buildAdminFreeTrainingNewRegistrationMessage(cfg, reg, title, venue)
				if err := sendTextAPI(ctx, cfg, adminPhone, msg); err != nil {
					log.Printf("whatsapp sendText (free training admin register): %v", err)
				}
			}
		}()
		return
	}

	p := strings.ToLower(strings.TrimSpace(cfg.WhatsAppProvider))
	if p == "" {
		return
	}
	msg := buildAdminFreeTrainingNewRegistrationMessage(cfg, reg, title, venue)
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 18*time.Second)
		defer cancel()
		var err error
		switch p {
		case "callmebot":
			err = sendCallMeBot(ctx, cfg, msg)
		case "ultramsg":
			err = sendUltramsg(ctx, cfg, msg)
		default:
			return
		}
		if err != nil {
			log.Printf("whatsapp notify free training register (%s): %v", p, err)
		}
	}()
}

// FreeTrainingPreceptsNotice sends a WhatsApp to the applicant when status becomes *precepts* (sendText API only).
func FreeTrainingPreceptsNotice(cfg *config.Config, reg *models.FreeTrainingRegistration, prog *models.FreeTrainingProgram) {
	if cfg == nil || reg == nil || !sendTextConfigured(cfg) {
		return
	}
	phone := digitsOnly(reg.Phone)
	if phone == "" {
		return
	}
	title, _ := freeTrainingProgramLabels(prog)
	msg := buildFreeTrainingPreceptsMessage(reg, title)
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 22*time.Second)
		defer cancel()
		if err := sendTextAPI(ctx, cfg, phone, msg); err != nil {
			log.Printf("whatsapp sendText (free training precepts): %v", err)
		}
	}()
}

func freeTrainingProgramLabels(prog *models.FreeTrainingProgram) (title, venue string) {
	if prog == nil {
		return "Free training", ""
	}
	title = strings.TrimSpace(prog.Title)
	if title == "" {
		title = "Free training"
	}
	venue = strings.TrimSpace(prog.VenueLocation)
	return title, venue
}

func buildFreeTrainingThankYouMessage(reg *models.FreeTrainingRegistration, programTitle, venue string) string {
	name := strings.TrimSpace(reg.FullName)
	if name == "" {
		name = "there"
	}
	venueLine := ""
	if venue != "" {
		venueLine = fmt.Sprintf("\n• *Venue / area:* %s", venue)
	}
	return fmt.Sprintf(`🌟 *Thank you — registration received*

Hello *%s*,

We've received your interest in *%s*.%s

*What happens next?*
• Our team will review your details.
• If you're shortlisted or moved forward, we'll contact you on *WhatsApp* or by *email*.

Questions? Reply to this chat.

— *Baraarug* ✨`, name, programTitle, venueLine)
}

func buildAdminFreeTrainingNewRegistrationMessage(cfg *config.Config, reg *models.FreeTrainingRegistration, programTitle, venue string) string {
	phone := strings.TrimSpace(reg.Phone)
	if phone == "" {
		phone = "—"
	}
	loc := strings.TrimSpace(reg.Location)
	if loc == "" {
		loc = "—"
	}
	if venue == "" {
		venue = "—"
	}
	msg := ""
	if reg.Message != nil {
		msg = strings.TrimSpace(*reg.Message)
	}
	if msg == "" {
		msg = "—"
	}
	dash := strings.TrimRight(strings.TrimSpace(cfg.PublicDashboardURL), "/")
	dashLine := ""
	if dash != "" {
		dashLine = fmt.Sprintf("\n📂 *Dashboard:* %s", dash)
	}
	return fmt.Sprintf(`━━━━━━━━━━━━━━━━━━
📋 *NEW FREE TRAINING SIGNUP*
━━━━━━━━━━━━━━━━━━

*Programme:* _%s_
*Venue (public):* %s

*Contact*
• *Name:* %s
• *Email:* %s
• *WhatsApp:* %s
• *Location:* %s

*Note from applicant*
_%s_

🆔 *Registration ID:* %s%s`,
		programTitle,
		venue,
		strings.TrimSpace(reg.FullName),
		reg.Email,
		phone,
		loc,
		msg,
		reg.ID.String(),
		dashLine,
	)
}

func buildFreeTrainingPreceptsMessage(reg *models.FreeTrainingRegistration, programTitle string) string {
	name := strings.TrimSpace(reg.FullName)
	if name == "" {
		name = "there"
	}
	return fmt.Sprintf(`Hello *%s*,

Good news: you've been added to the *Precepts* step for *%s*.

Our team will follow up with you on *WhatsApp* with the next details.

— *Baraarug*`, name, programTitle)
}

func TrainingApplicationSubmitted(cfg *config.Config, app *models.Application, training *models.Training) {
	if cfg == nil || app == nil {
		return
	}
	title := ""
	if training != nil {
		title = strings.TrimSpace(training.Title)
	}

	if sendTextConfigured(cfg) {
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 22*time.Second)
			defer cancel()
			applicantPhone := digitsOnly(ptrStr(app.Phone))
			if applicantPhone != "" {
				msg := buildApplicantThankYouMessage(app, title)
				if err := sendTextAPI(ctx, cfg, applicantPhone, msg); err != nil {
					log.Printf("whatsapp sendText (applicant apply): %v", err)
				}
			}
			adminPhone := digitsOnly(cfg.WhatsAppNotifyTo)
			if adminPhone != "" {
				msg := buildAdminNewApplicationMessage(cfg, app, title)
				if err := sendTextAPI(ctx, cfg, adminPhone, msg); err != nil {
					log.Printf("whatsapp sendText (admin apply): %v", err)
				}
			}
		}()
		return
	}

	p := strings.ToLower(strings.TrimSpace(cfg.WhatsAppProvider))
	if p == "" {
		return
	}
	msg := buildAdminNewApplicationMessage(cfg, app, title)

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 18*time.Second)
		defer cancel()

		var err error
		switch p {
		case "webhook":
			err = sendWebhook(ctx, cfg, app, training, msg)
		case "callmebot":
			err = sendCallMeBot(ctx, cfg, msg)
		case "ultramsg":
			err = sendUltramsg(ctx, cfg, msg)
		default:
			return
		}
		if err != nil {
			log.Printf("whatsapp notify (%s): %v", p, err)
		}
	}()
}

// NotifyApplicantApproved sends a congratulations WhatsApp when an application is approved (uses sendText API).
// If customMessage is non-empty, it is sent as the body (with a short footer); otherwise the default approved template is used.
func NotifyApplicantApproved(cfg *config.Config, app *models.Application, training *models.Training, customMessage string) {
	if cfg == nil || app == nil || !sendTextConfigured(cfg) {
		return
	}
	phone := digitsOnly(ptrStr(app.Phone))
	if phone == "" {
		return
	}
	title := ""
	if training != nil {
		title = strings.TrimSpace(training.Title)
	}
	custom := strings.TrimSpace(customMessage)
	var msg string
	if custom != "" {
		msg = custom
	} else {
		msg = buildApplicantApprovedMessage(app, title)
	}

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 22*time.Second)
		defer cancel()
		if err := sendTextAPI(ctx, cfg, phone, msg); err != nil {
			log.Printf("whatsapp sendText (approved): %v", err)
		}
	}()
}

func sendTextConfigured(cfg *config.Config) bool {
	return strings.TrimSpace(cfg.WhatsAppSendTextURL) != "" && strings.TrimSpace(cfg.WhatsAppSendTextAPIKey) != ""
}

type sendTextPayload struct {
	ChatID                 string  `json:"chatId"`
	ReplyTo                *string `json:"reply_to"`
	Text                   string  `json:"text"`
	LinkPreview            bool    `json:"linkPreview"`
	LinkPreviewHighQuality bool    `json:"linkPreviewHighQuality"`
	Session                string  `json:"session"`
}

func sendTextAPI(ctx context.Context, cfg *config.Config, phoneDigits string, text string) error {
	u := strings.TrimSpace(cfg.WhatsAppSendTextURL)
	if u == "" || len(phoneDigits) < 6 {
		return fmt.Errorf("sendText: missing url or phone")
	}
	sess := strings.TrimSpace(cfg.WhatsAppSendTextSession)
	if sess == "" {
		sess = "default"
	}
	body := sendTextPayload{
		ChatID:                 phoneDigits + "@c.us",
		ReplyTo:                nil,
		Text:                   text,
		LinkPreview:            true,
		LinkPreviewHighQuality: false,
		Session:                sess,
	}
	raw, err := json.Marshal(body)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u, bytes.NewReader(raw))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Api-Key", strings.TrimSpace(cfg.WhatsAppSendTextAPIKey))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	slurp, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("sendText %s: %s", resp.Status, strings.TrimSpace(string(slurp)))
	}
	return nil
}

func applicantThankYouGreeting(app *models.Application) string {
	at := strings.TrimSpace(strings.ToLower(app.ApplicantType))
	if at == "" {
		at = "individual"
	}
	if at == "organization" {
		if co := strings.TrimSpace(ptrStr(app.Company)); co != "" {
			return co
		}
	}
	fn := strings.TrimSpace(ptrStr(app.FirstName))
	ln := strings.TrimSpace(ptrStr(app.LastName))
	if n := strings.TrimSpace(fn + " " + ln); n != "" {
		return n
	}
	if co := strings.TrimSpace(ptrStr(app.Company)); co != "" {
		return co
	}
	return "there"
}

func buildApplicantThankYouMessage(app *models.Application, trainingTitle string) string {
	greeting := applicantThankYouGreeting(app)
	if trainingTitle == "" {
		trainingTitle = "your selected programme"
	}
	return fmt.Sprintf(`🌟 *Thank you — we've received your application*

Dear *%s*,

Your interest in *%s* means a lot to us. Your application is now with our team.

*What happens next?*
• We review every application with care.
• You'll hear from us soon on *WhatsApp* or by *email* with the next steps.

Questions? Just reply to this chat or reach out through our usual channels.

_With gratitude,_
*Baraarug Consulting Firm* ✨`, greeting, trainingTitle)
}

func buildApplicantApprovedMessage(app *models.Application, trainingTitle string) string {
	name := applicantDisplayName(app)
	if trainingTitle == "" {
		trainingTitle = "your programme"
	}
	return fmt.Sprintf(`Hello %s,

Good news: your application for *%s* has been *approved*.

We will share the next steps with you shortly.

— Baraarug Consulting Firm`, name, trainingTitle)
}

func applicantDisplayName(app *models.Application) string {
	fn := strings.TrimSpace(ptrStr(app.FirstName))
	ln := strings.TrimSpace(ptrStr(app.LastName))
	n := strings.TrimSpace(fn + " " + ln)
	if n == "" {
		return "there"
	}
	return n
}

func formatParticipantBand(band, custom string) string {
	b := strings.TrimSpace(band)
	switch b {
	case "1_10":
		return "1–10"
	case "11_50":
		return "11–50"
	case "51_200":
		return "51–200"
	case "200_plus":
		return "200+"
	case "custom":
		c := strings.TrimSpace(custom)
		if c != "" {
			return "Custom (" + c + ")"
		}
		return "Custom"
	default:
		if b == "" {
			return "—"
		}
		return b
	}
}

func formatTrainingFormatLabel(s string) string {
	switch strings.TrimSpace(strings.ToLower(s)) {
	case "online":
		return "Online"
	case "in_person":
		return "In-person"
	case "hybrid":
		return "Hybrid"
	default:
		if strings.TrimSpace(s) == "" {
			return "—"
		}
		return s
	}
}

func participantRolesReadable(app *models.Application) string {
	if len(app.ParticipantRoles) == 0 {
		return "—"
	}
	var roles []string
	if err := json.Unmarshal(app.ParticipantRoles, &roles); err != nil || len(roles) == 0 {
		return "—"
	}
	label := map[string]string{
		"executives":  "Executives",
		"managers":    "Managers",
		"team_leads":  "Team leads",
		"staff":       "Staff",
	}
	var out []string
	for _, r := range roles {
		r = strings.TrimSpace(r)
		if r == "" {
			continue
		}
		if l, ok := label[r]; ok {
			out = append(out, l)
		} else {
			out = append(out, r)
		}
	}
	if len(out) == 0 {
		return "—"
	}
	return strings.Join(out, ", ")
}

func buildAdminNewApplicationMessage(cfg *config.Config, app *models.Application, trainingTitle string) string {
	fn := ptrStr(app.FirstName)
	ln := ptrStr(app.LastName)
	name := strings.TrimSpace(strings.TrimSpace(fn + " " + ln))
	if name == "" {
		name = "—"
	}
	phone := ptrStr(app.Phone)
	if phone == "" {
		phone = "—"
	}
	co := ptrStr(app.Company)
	if co == "" {
		co = "—"
	}
	amsg := ptrStr(app.Message)
	if amsg == "" {
		amsg = "—"
	}
	if trainingTitle == "" {
		trainingTitle = "—"
	}
	at := strings.TrimSpace(strings.ToLower(app.ApplicantType))
	if at == "" {
		at = "individual"
	}
	typeLabel := "Individual"
	if at == "organization" {
		typeLabel = "Organization"
	}

	dash := strings.TrimRight(strings.TrimSpace(cfg.PublicDashboardURL), "/")
	dashLine := ""
	if dash != "" {
		dashLine = fmt.Sprintf("\n\n📂 *Dashboard:* %s", dash)
	}

	job := ptrStr(app.JobTitle)
	if job == "" {
		job = "—"
	}

	var orgBlock string
	if at == "organization" {
		band := formatParticipantBand(ptrStr(app.EmployeeCountBand), ptrStr(app.EmployeeCountCustom))
		roles := participantRolesReadable(app)
		tf := formatTrainingFormatLabel(ptrStr(app.TrainingFormat))
		pc := "—"
		if app.ParticipantCount != nil && *app.ParticipantCount > 0 {
			pc = fmt.Sprintf("%d", *app.ParticipantCount)
		}
		orgBlock = fmt.Sprintf(`

*Organization details*
• *Participants (range):* %s
• *Exact count (if given):* %s
• *Roles:* %s
• *Preferred format:* %s`, band, pc, roles, tf)
	}

	return fmt.Sprintf(`━━━━━━━━━━━━━━━━━━
📋 *NEW APPLICATION — review needed*
━━━━━━━━━━━━━━━━━━

*Programme*
_%s_

*Applicant type:* %s

*Contact*
📧 %s
📱 WhatsApp: %s

*Profile*
• *Name:* %s
• *Organization:* %s
• *Job title:* %s%s

*Applicant note*
_%s_

━━━━━━━━━━━━━━━━━━
🆔 *Application ID:* %s
🔗 *Training ID:* %s%s`,
		trainingTitle,
		typeLabel,
		app.Email,
		phone,
		name,
		co,
		job,
		orgBlock,
		amsg,
		app.ID.String(),
		app.TrainingID.String(),
		dashLine,
	)
}

func ptrStr(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}

type webhookPayload struct {
	Event   string           `json:"event"`
	To      string           `json:"to,omitempty"`
	Message string           `json:"message"`
	Data    webhookDataBlock `json:"data"`
}

type webhookDataBlock struct {
	ApplicationID    string `json:"application_id"`
	TrainingID       string `json:"training_id"`
	TrainingTitle    string `json:"training_title"`
	Email            string `json:"email"`
	FirstName        string `json:"first_name"`
	LastName         string `json:"last_name"`
	Phone            string `json:"phone"`
	Company          string `json:"company"`
	ApplicantMessage string `json:"applicant_message"`
	DashboardURL     string `json:"dashboard_url"`
}

func sendWebhook(ctx context.Context, cfg *config.Config, app *models.Application, training *models.Training, msg string) error {
	u := strings.TrimSpace(cfg.WhatsAppWebhookURL)
	if u == "" {
		return fmt.Errorf("WHATSAPP_WEBHOOK_URL is empty")
	}

	title := ""
	if training != nil {
		title = strings.TrimSpace(training.Title)
	}

	body := webhookPayload{
		Event:   "training_application",
		To:      strings.TrimSpace(cfg.WhatsAppNotifyTo),
		Message: msg,
	}
	body.Data.ApplicationID = app.ID.String()
	body.Data.TrainingID = app.TrainingID.String()
	body.Data.TrainingTitle = title
	body.Data.Email = app.Email
	body.Data.FirstName = ptrStr(app.FirstName)
	body.Data.LastName = ptrStr(app.LastName)
	body.Data.Phone = ptrStr(app.Phone)
	body.Data.Company = ptrStr(app.Company)
	body.Data.ApplicantMessage = ptrStr(app.Message)
	body.Data.DashboardURL = strings.TrimSpace(cfg.PublicDashboardURL)

	raw, err := json.Marshal(body)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u, bytes.NewReader(raw))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if b := strings.TrimSpace(cfg.WhatsAppWebhookBearer); b != "" {
		req.Header.Set("Authorization", "Bearer "+b)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		slurp, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		return fmt.Errorf("webhook %s: %s", resp.Status, strings.TrimSpace(string(slurp)))
	}
	return nil
}

func sendCallMeBot(ctx context.Context, cfg *config.Config, msg string) error {
	key := strings.TrimSpace(cfg.WhatsAppCallMeBotAPIKey)
	phone := digitsOnly(cfg.WhatsAppNotifyTo)
	if key == "" || phone == "" {
		return fmt.Errorf("WHATSAPP_CALLMEBOT_APIKEY and WHATSAPP_NOTIFY_TO are required")
	}

	u, err := url.Parse("https://api.callmebot.com/whatsapp.php")
	if err != nil {
		return err
	}
	q := u.Query()
	q.Set("phone", phone)
	q.Set("text", msg)
	q.Set("apikey", key)
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("callmebot %s: %s", resp.Status, strings.TrimSpace(string(b)))
	}
	s := strings.ToLower(strings.TrimSpace(string(b)))
	if strings.Contains(s, "error") || strings.Contains(s, "invalid") {
		return fmt.Errorf("callmebot: %s", string(b))
	}
	return nil
}

func sendUltramsg(ctx context.Context, cfg *config.Config, msg string) error {
	inst := strings.TrimSpace(cfg.WhatsAppUltramsgInstance)
	tok := strings.TrimSpace(cfg.WhatsAppUltramsgToken)
	to := digitsOnly(cfg.WhatsAppNotifyTo)
	if inst == "" || tok == "" || to == "" {
		return fmt.Errorf("WHATSAPP_ULTRAMSG_INSTANCE, WHATSAPP_ULTRAMSG_TOKEN, and WHATSAPP_NOTIFY_TO are required")
	}

	apiURL := fmt.Sprintf("https://api.ultramsg.com/instance%s/messages/chat", inst)
	form := url.Values{}
	form.Set("token", tok)
	form.Set("to", to)
	form.Set("body", msg)
	form.Set("priority", "10")

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, apiURL, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("ultramsg %s: %s", resp.Status, strings.TrimSpace(string(b)))
	}
	return nil
}

func digitsOnly(s string) string {
	var b strings.Builder
	for _, r := range s {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}
