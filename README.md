# Sanele Analytics Platform

A portfolio analytics platform built with **React · TypeScript · Vite · Tailwind CSS**, served by **Nginx** and deployable via **Docker Compose** or **Vercel**.

The platform contains three projects, each targeting a specific role:

| Project | Route | Role target |
|---|---|---|
| Loan Targeting Analysis | `/notebook` | Data Analyst / ML Engineer |
| Tsunami Dashboard | `/dashboard` | Business Intelligence / Power BI |
| AI Operations Dashboard | `/ai-ops` | AI Operations Engineer (Santi4) |

**Live demo:** [sanele-analytics.vercel.app](https://sanele-analytics.vercel.app)

---

## Projects

### Loan Targeting Analysis (`/notebook`)
An exploratory data analysis and machine-learning pipeline for predicting personal loan uptake, rendered as a self-contained Jupyter Notebook (converted to HTML via `nbconvert` during the Docker build).

### Tsunami Dashboard (`/dashboard`)
A Power BI embedded report combined with an interactive Leaflet map and Recharts visualisations, displaying historical tsunami event data.

### AI Operations Dashboard (`/ai-ops`)
An end-to-end demonstration of AI Operations Engineering skills, structured around the Santi4 AI Operations Engineer job specification. It has five tabs:

| Tab | What it demonstrates |
|---|---|
| **Pipeline Monitor** | Monitoring OCR → Extraction → Validation → Routing → Submission pipelines; distinguishing stage failures |
| **Prompt Regression** | Golden test datasets (pass / fail / edge cases), prompt version history, extraction accuracy tracking |
| **Agent Config** | YAML-driven agent definitions, mapper configurations, tenant assignments, endpoint routing |
| **API Explorer** | REST endpoint documentation with request/response payloads, auth headers, HTTP status codes |
| **Triage Center** | Structured failure triage: observed behaviour, reproduction steps, diagnosis (config / prompt / data / code defect), resolution |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Charts | Recharts |
| Maps | Leaflet + React-Leaflet |
| Web server | Nginx 1.27 (Alpine) |
| Container | Docker multi-stage build (Python → Node → Nginx) |
| CI / Hosting | Vercel (production), Docker Compose (local) |

---

## Local Development

### Prerequisites
- Node.js 20+
- npm 9+

```bash
# Install dependencies
cd frontend
npm install

# Start dev server (http://localhost:5173)
npm run dev
```

### Lint
```bash
npm run lint          # ESLint — zero warnings policy
```

### Type check + production build
```bash
npm run build         # tsc + vite build → frontend/dist/
```

---

## Docker (full production build)

The Dockerfile uses a three-stage build:

1. **`notebook-converter`** — Python 3.11-slim runs `jupyter nbconvert` to produce `loan_targeting_analysis.html`
2. **`builder`** — Node 20 Alpine installs dependencies and runs `vite build`
3. **`production`** — Nginx 1.27 Alpine serves the compiled SPA with security headers and gzip compression

```bash
# Build and start
docker compose up --build

# App is available at http://localhost:3000
```

To rebuild after source changes:
```bash
docker compose up --build --force-recreate
```

To stop:
```bash
docker compose down
```

### Nginx security headers

The Nginx configuration sets the following headers on every response:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

Notebook iframes are served under `X-Frame-Options: SAMEORIGIN` (narrowed scope).

Static assets with content-hashed filenames are cached for one year (`immutable`). The SPA entry point is served with `no-store` to ensure users always receive the latest shell.

---

## Vercel Deployment

The project deploys automatically from the `master` branch via the Vercel Git integration.

| Setting | Value |
|---|---|
| Build command | `cd frontend && npm install --legacy-peer-deps && npm run build` |
| Output directory | `frontend/dist` |
| Install command | `echo skip` |
| SPA rewrites | `/(.*) → /index.html` |

> **Note:** The Jupyter Notebook HTML (`frontend/public/notebooks/loan_targeting_analysis.html`) is committed to the repository so the Vercel build does not require a Python runtime.

### Manual deploy

```bash
npm i -g vercel
vercel --prod
```

---

## Environment Variables

Copy `frontend/.env.example` to `frontend/.env` and fill in the values before running locally.

| Variable | Required | Description |
|---|---|---|
| `VITE_POWERBI_IFRAME_URL` | No | Publish-to-web iframe URL for the Power BI report (Option A) |

See `frontend/.env.example` for the full configuration options including the secure embed (Azure AD) path.

---

## Project Structure

```
sanele-analytics/
├── Dockerfile                   # Multi-stage Docker build
├── docker-compose.yml           # Local production stack
├── nginx.conf                   # Nginx server config (security headers, SPA routing, gzip)
├── vercel.json                  # Vercel deployment configuration
├── loan_targeting_analysis.ipynb # Source notebook (converted to HTML at build time)
└── frontend/
    ├── .eslintrc.cjs            # ESLint config (zero-warnings policy)
    ├── .env.example             # Environment variable template
    ├── public/
    │   └── notebooks/
    │       └── loan_targeting_analysis.html  # Pre-built notebook (committed)
    └── src/
        ├── App.tsx              # Router — /notebook, /dashboard, /ai-ops
        ├── components/
        │   ├── Layout/          # Header, Sidebar, outlet wrapper
        │   ├── PowerBIViewer.tsx
        │   └── TsunamiDashboard.tsx
        ├── data/
        │   ├── aiOpsData.ts     # AI Ops mock data (pipeline runs, agents, triage cases)
        │   └── tsunamiData.ts
        └── pages/
            ├── AIOpsDashboard.tsx  # AI Ops — 5-tab dashboard
            ├── NotebookPage.tsx
            └── PowerBIPage.tsx
```

---

## Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | TypeScript check + production bundle |
| `npm run lint` | ESLint (zero warnings, fails CI on any warning) |
| `npm run preview` | Preview the production bundle locally |
| `docker compose up --build` | Full production stack (Notebook → Vite build → Nginx) |
