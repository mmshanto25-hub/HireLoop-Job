# HireLoop — Production-Ready MERN Job Hunting & Recruitment Platform

HireLoop is a modern full-stack web application connecting **Job Seekers**, **Recruiters**, and **Administrators** through a secure, high-performance architecture. Built with React 18, Vite, Node.js, Express, MongoDB (Mongoose), and TypeScript across a monorepo.

---

## 🚀 Key Features

### For Job Seekers
* **Job Discovery**: Keyword, category, job-type, salary range, location, and remote status filters with server-side pagination and URL sync.
* **1-Click Application**: Apply with customizable cover letters, PDF resume uploads, or saved profile credentials.
* **Application Tracker**: Real-time status pipeline (`Applied` ➔ `Under Review` ➔ `Shortlisted` ➔ `Offered` / `Rejected`).
* **Saved Jobs**: Quick bookmarking with plan-based quotas.
* **Seeker Dashboard**: KPI metrics, profile strength meter, interactive status pipeline, and intelligent job recommendations based on candidate skills.

### For Recruiters
* **Employer Branding**: Register, verify, and brand organizations with logos and headquarter details.
* **Job Management**: Full lifecycle CRUD (draft, publish, edit, close, duplicate, feature) with quota enforcement.
* **Candidate Management**: Review incoming applications per opening, stream confidential PDF resumes securely, update statuses, leave private recruiter notes, and schedule interviews.
* **Recruitment Analytics**: 30-day candidate acquisition velocity, candidate status funnel drop-off, average time-to-hire metrics, and per-job conversion analytics.

### For Administrators
* **Platform Operations**: High-level platform KPIs, user registration trends, and sector distribution charts.
* **User Management**: Search by name or email, role inspection, dynamic role assignment/revocation, and instant suspension/reactivation.
* **Company Moderation**: Approve or reject pending employer organizations with feedback.
* **Job Moderation**: Feature prominent listings or administratively close policy-violating roles with full audit logs.
* **Billing & Ledger**: Summary of active subscriptions, gross revenue, and audited transaction report export (CSV).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS v4, React Router v7, TanStack Query v5, Zustand, React Hook Form, Zod, Lucide React, Sonner |
| **Backend** | Node.js (>=22.9), Express.js, TypeScript, Mongoose, Zod, Helmet, Pino structured logging, Jose (JWT), Bcrypt.js, Multer |
| **Shared** | `@hireloop/shared` monorepo package for domain constants, types, and Zod schemas |
| **Testing** | Vitest, Supertest, Testing Library |
| **Database** | MongoDB (Atlas or Local 6.0+) |

---

## 📁 Repository Layout

```
hireloop/
├── apps/
│   ├── api/                     # Node.js + Express backend
│   │   ├── src/
│   │   │   ├── config/          # Zod env validation, MongoDB connection
│   │   │   ├── controllers/     # Thin HTTP controllers
│   │   │   ├── middleware/      # Auth, CSRF, rate limiters, file upload
│   │   │   ├── models/          # 11 Mongoose collections with compound indexes
│   │   │   ├── routes/          # Versioned REST endpoints (/api/v1/*)
│   │   │   ├── services/        # Business logic, authorization, aggregation
│   │   │   ├── scripts/         # Idempotent seed and admin bootstrap scripts
│   │   │   └── tests/           # Vitest unit and integration suites
│   └── web/                     # React + Vite frontend
│       ├── src/
│       │   ├── components/      # UI components, layout, dialogs, modals
│       │   ├── features/        # TanStack query hooks and API callers
│       │   ├── hooks/           # Document title & SEO helpers
│       │   ├── pages/           # Public pages & role-specific dashboards
│       │   └── styles/          # Tailwind CSS design tokens (light/dark mode)
│       └── public/              # Robots.txt, sitemap.xml, assets
├── packages/
│   └── shared/                  # Common TypeScript interfaces & Zod validators
└── package.json                 # Monorepo workspaces configuration
```

---

## 🏁 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: `v22.9.0` or higher
- **npm**: `v10` or higher
- **MongoDB**: Local `mongod` instance or MongoDB Atlas connection URI

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/hireloop.git
cd hireloop

# Install all workspace dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `apps/api/.env`:
```bash
cp .env.example apps/api/.env
```

Generate 3 unique 48-byte secrets for token signing:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Configure `apps/api/.env`:
```ini
NODE_ENV=development
PORT=4000
WEB_URL=http://localhost:5173
API_URL=http://localhost:4000
MONGODB_URI=mongodb://127.0.0.1:27017/hireloop

SESSION_SECRET=your_generated_session_secret
ACCESS_TOKEN_SECRET=your_generated_access_token_secret
REFRESH_TOKEN_SECRET=your_generated_refresh_token_secret

EMAIL_PROVIDER=console
EMAIL_FROM=HireLoop <no-reply@localhost>
```

### 4. Database Seeding
Populate the database with realistic demo companies, 40 jobs, applications, and accounts:
```bash
npm run seed
```

### 5. Running the Application
```bash
npm run dev
```

Visit:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **API Health Check**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)
- **API Readiness Check**: [http://localhost:4000/api/v1/ready](http://localhost:4000/api/v1/ready)

---

## 🔑 Demo Account Credentials

The seed script creates the following pre-configured demonstration accounts:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Administrator** | `admin@hireloop.dev` | `Password123!` | Moderation, users, company approval, payments |
| **Recruiter** | `recruiter@hireloop.dev` | `Password123!` | Employer branding, job posting, applicant pipeline |
| **Recruiter 2** | `recruiter2@hireloop.dev` | `Password123!` | Additional organization & active openings |
| **Job Seeker** | `seeker@hireloop.dev` | `Password123!` | Pre-filled profile, submitted applications, saved jobs |
| **Job Seeker 2** | `seeker2@hireloop.dev` | `Password123!` | AI specialist with an active job offer |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs shared watcher, API backend, and Vite frontend concurrently |
| `npm run typecheck` | Compiles TypeScript across all packages with zero errors |
| `npm run test` | Runs all backend and frontend Vitest suites |
| `npm run build` | Compiles `@hireloop/shared`, `@hireloop/api`, and builds Vite web bundle |
| `npm run seed` | Idempotently seeds demo users, companies, jobs, applications, and stats |
| `npm run bootstrap:admin` | Creates or grants administrative permissions to a specific user securely |

---

## 🔒 Security & Privacy Architecture

- **HTTP-Only Cookie Sessions**: Access and refresh tokens are stored in secure HTTP-only cookies (`SameSite=Lax` / `Strict`), protected against XSS.
- **CSRF Protection**: Double-submit CSRF cookie & header validation protects all state-changing mutations (`POST`, `PATCH`, `DELETE`).
- **Authorization & RBAC**: Every endpoint enforces `requireAuth`, `requireRole`, and strict resource ownership guards (`requireResourceOwnership`).
- **Private Document Streaming**: Resumes are stored in private storage (`uploads/private`) with randomized object keys. Resumes can only be streamed by authorized recruiters of that specific job or the candidate themselves.
- **Admin Invariant Protection**: An admin cannot suspend their own account or remove their own admin role; the last active administrator on the platform cannot be removed.
- **Rate Limiting**: Tiered IP-based rate limiting on sensitive auth endpoints, search queries, and application submissions.

---

## 🌐 SEO, Indexing & Accessibility

- **Robots & Sitemap**: Configured `robots.txt` and `sitemap.xml` in `apps/web/public/` allowing indexing of public openings while disallowing authenticated dashboard URLs.
- **Structured Data**: Injects JSON-LD schema (`schema.org/JobPosting` and `schema.org/Organization`) for search engine rich snippets.
- **WCAG AA Compliance**: High-contrast tokens, keyboard focus rings, screen-reader status announcements, and reduced-motion animations.

---

## 🚢 Production Deployment

### 1. Frontend (Vercel / Netlify / Cloudflare Pages)
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build -w @hireloop/web`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Your production API domain (e.g. `https://api.hireloop.dev`)

### 2. Backend (Render / Railway / AWS / Docker)
- **Root Directory**: repository root
- **Build Command**: `npm run build -w @hireloop/shared && npm run build -w @hireloop/api`
- **Start Command**: `npm run start -w @hireloop/api`
- **Environment Variables**:
  - Set all production environment variables from `.env.example`
  - Set `NODE_ENV=production`
  - Set `COOKIE_DOMAIN` and explicit `WEB_URL` for CORS allow-listing.
