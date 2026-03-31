.PHONY: db-up db-down run build-api seed-admin build-seed-admin

# Start PostgreSQL (port 5433). Requires Docker Desktop running.
db-up:
	docker compose up -d

db-down:
	docker compose down

# Run API from repo root: make run
run:
	go run ./cmd

# Production binary (same as scripts/vps-deploy.sh)
build-api:
	go build -o bcf-api ./cmd

# Standalone binary for VPS (no Go install on server): scp seed-admin + run with ADMIN_EMAIL / ADMIN_PASSWORD
build-seed-admin:
	go build -o seed-admin ./cmd/seed-admin

# Create/update admin user (role=admin, full dashboard). Requires ADMIN_EMAIL and ADMIN_PASSWORD (8+ chars).
seed-admin:
	@test -n "$$ADMIN_EMAIL" && test -n "$$ADMIN_PASSWORD" || (echo "Usage: ADMIN_EMAIL=a@b.com ADMIN_PASSWORD='...' make seed-admin"; exit 1)
	go run ./cmd/seed-admin
