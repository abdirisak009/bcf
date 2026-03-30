# BCF / Bararug Website

Next.js frontend with a Go backend (`backend/`).

## Local development

- Frontend: `pnpm install` then `pnpm dev`
- Backend: copy `backend/.env.example` → `backend/.env`, start Postgres (`cd backend && make db-up`), then `cd backend && make run`

## Production (VPS)

See **[DEPLOY.md](./DEPLOY.md)** for environment files, `git pull` + `./scripts/vps-deploy.sh`, systemd, and Nginx.
