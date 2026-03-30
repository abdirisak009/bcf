.PHONY: db-up db-down run build-api

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
