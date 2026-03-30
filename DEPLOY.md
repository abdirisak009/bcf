# Production deployment (VPS)

Goal: on the VPS, run **`./scripts/vps-deploy.sh`** from the repo root — it runs **`git pull --ff-only`**, rebuilds the API and Next.js, then you restart services. Secrets stay **out of git** (copy from `*.example` files).

### Waa inaad joogtid root-ka repo-ga (muhiim)

- **Repo root** waa folder-ka uu `deployment.config.example.json` ku yaalo (oo leh `backend/`, `scripts/`). Haddii aad joogtid `~/bcf/backend`, `cp deployment.config...` wuu fali doonaa — marka `cd ~/bcf` (ama meesha aad clone gareysay).
- Tilmaamaha ku jira `/opt/bararug-website` waa **tusaale** kaliya. Haddii project-kaagu yahay `~/bcf`, isticmaal `~/bcf` meel kasta oo `/opt/bararug-website` lagu sheegay (deploy script, systemd, Nginx).
- **Ha paste gareysan** xariiqaha `root@srv1540911:~#` ama fariimaha qaladka (`cp: cannot stat...`) — Bash wuxuu isku dayaa inuu kuwaas u sameeyo **amarro**, taas oo keeni `command not found`.
- **`systemctl restart bcf-api`** kaliya marka aad horay u dhigtay unit-yada systemd (qaybta §5). Haddii aadan weli dhigin, qaladku waa *Unit not found* — taasi waa caadi.

### Hubi hal mar

```bash
cd ~/bcf    # beddel ~/bcf haddii clone-ku meel kale yahay
pwd
ls deployment.config.example.json backend/.env.production.example
```

Haddii `ls` uu muujiyo labada fayl, waxaad joogtaa sax.

### Haddii `deployment.config.example.json` uusan VPS-ga ka jirin

Tani waxay dhacdaa marka **GitHub / remote** uusan weli haysan faylka (ama `git pull` aan la samayn). Xal:

1. Kompiyutarkaaga (project-ka oo dhameystiran): hubi in faylka uu repo-ga ku jiro, ka dibna `git push`.
2. VPS: `cd ~/bcf && git pull`.

Haddii aadan haysan push: abuur `deployment.config.json` toos (maahan inaad haysato `.example`); ku dheji `nano deployment.config.json` oo ku qor JSON isku eka `deployment.config.example.json` ee repo-ga (GitHub → faylka → Raw → copy). **Ha gelin** sirta dhabta ah GitHub haddii repo-ga uu yahay mid dadweyne ah — isticmaal `your_password_here` VPS-ga, ka dibna beddel.

## What runs

| Piece | Role |
|--------|------|
| PostgreSQL | Database (port **5433** if you use `backend/docker-compose.yml`) |
| Go API (`backend/bcf-api`) | Listens on **8080** by default |
| Next.js (`pnpm start`) | Listens on **3000** by default |
| Nginx (recommended) | HTTPS + reverse proxy to 3000 and `/api` → 8080 |

## One-time server setup

### 1. Dependencies

- **Go** 1.22+ (match `backend/go.mod`)
- **Node.js** 20 LTS + **pnpm** (`corepack enable && corepack prepare pnpm@latest --activate`)
- **PostgreSQL** 15+ *or* Docker only for Postgres (`backend/docker-compose.yml`)

### 2. Clone and secrets

```bash
sudo mkdir -p /opt/bararug-website
sudo chown "$USER:$USER" /opt/bararug-website
cd /opt/bararug-website
git clone <YOUR_REPO_URL> .
```

Copy and edit (never commit real values):

```bash
cp deployment.config.example.json deployment.config.json
cp .env.production.example .env.production
cp backend/.env.production.example backend/.env
```

- **`deployment.config.json`** — shared: `frontend.NEXT_PUBLIC_*` (baked at **build** time) and `backend.*` (API reads these if env vars are unset). For a public site behind one domain, set e.g. `NEXT_PUBLIC_API_URL` to `https://yourdomain.com` so the browser calls `https://yourdomain.com/api/...` (see Nginx below).
- **`backend/.env`** — database password, `JWT_SECRET`, `CORS_ALLOW_ORIGINS` (comma-separated: your `https://` site, optional `http://VPS_IP`), optional WhatsApp keys, etc.

### 3. Database

**Option A — Docker (matches dev):**

```bash
cd backend && docker compose up -d && cd ..
```

**Option B — system PostgreSQL:** create user/database matching `DB_*` in `backend/.env`, then run migrations if your workflow uses them (see `backend/`).

### 4. First admin user (optional)

From `backend/`, with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`:

```bash
go run ./cmd/seed-admin
```

### 5. Systemd + Nginx (recommended)

Replace `/opt/bararug-website` with your real path (e.g. clone under `/srv/bcf` or `/opt/bararug-website`). **Avoid keeping the app only under `/root/...`** if systemd uses `User=www-data` — `www-data` cannot read files in `/root`. Either clone to `/srv/bcf` and `chown -R www-data`, or edit the unit files to use `User=root` (less ideal).

```bash
sudo cp deploy/systemd/bcf-api.service.example /etc/systemd/system/bcf-api.service
sudo cp deploy/systemd/bcf-web.service.example /etc/systemd/system/bcf-web.service
sudo sed -i 's|/opt/bararug-website|/srv/bcf|g' /etc/systemd/system/bcf-api.service /etc/systemd/system/bcf-web.service
# Use your real path instead of /srv/bcf if different.
sudo systemctl daemon-reload
sudo systemctl enable --now bcf-api bcf-web
```

Ensure the service user can read the repo and write upload dirs, e.g. `sudo chown -R www-data:www-data /srv/bcf/public/uploads`.

```bash
sudo cp deploy/nginx/bcf.example.conf /etc/nginx/sites-available/bcf
sudo ln -sf /etc/nginx/sites-available/bcf /etc/nginx/sites-enabled/
# Edit server_name + SSL paths; then:
sudo nginx -t && sudo systemctl reload nginx
```

Use **Certbot** (`certbot --nginx`) for TLS once DNS points to the VPS.

## Updates (pull + rebuild)

From the **repository root** on the VPS:

```bash
./scripts/vps-deploy.sh
sudo systemctl restart bcf-api bcf-web
```

The script runs **`git pull --ff-only` first** automatically (when the folder is a git clone). To rebuild only without pulling: `SKIP_GIT_PULL=1 ./scripts/vps-deploy.sh`.

If you did not configure passwordless sudo, run the `systemctl restart` line manually.

The script:

1. Pulls latest changes (`git pull --ff-only`), unless `SKIP_GIT_PULL=1`
2. Builds `backend/bcf-api`
3. Runs `pnpm install --frozen-lockfile` and `pnpm build`

**Important:** after changing `deployment.config.json` or anything that affects `NEXT_PUBLIC_*`, you must run a **full frontend build** again (`pnpm build`), which this script does.

## Checklist

- [ ] `deployment.config.json` and `backend/.env` exist on the server (not in git)
- [ ] `CORS_ALLOW_ORIGINS` includes your real browser origin(s)
- [ ] `NEXT_PUBLIC_API_URL` matches how Nginx exposes the API (usually `https://yourdomain.com` with `/api/` proxied to the Go server)
- [ ] `JWT_SECRET` and `DASHBOARD_WRITE_KEY` are long random strings in production
- [ ] Firewall: allow 80/443 (and 22 for SSH); do not expose 5433 publicly if using Docker Postgres

## Troubleshooting

- **`127.0.0.1:8080` / “more-private address space loopback” / CORS from your VPS IP:** The browser runs on each visitor’s device. `NEXT_PUBLIC_API_URL` must be a **public** URL (e.g. `http://YOUR_VPS_IP:8080` or `https://yourdomain.com` behind Nginx), **never** `http://127.0.0.1:8080`. Set it in `deployment.config.json` or `.env.production`, then **`pnpm build`** again. Add your Next origin to `CORS_ALLOW_ORIGINS` (e.g. `http://62.72.35.109:3000`) and restart the API.
- **API 401 / CORS errors:** fix `CORS_ALLOW_ORIGINS` and reload the API.
- **Frontend still calls old API URL:** rebuild Next (`pnpm build`); `NEXT_PUBLIC_*` is embedded at build time.
- **502 from Nginx:** check `systemctl status bcf-api bcf-web` and that ports 8080 / 3000 match your unit files.
- **Vercel Analytics 404 on VPS:** Expected when not on Vercel; analytics only loads when `VERCEL=1`.
