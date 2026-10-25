# HireLoop

HireLoop is a job hunting and recruitment platform for **job seekers**, **recruiters** and **administrators**. It is a TypeScript MERN monorepo: React and Vite on the web, Express and MongoDB (Mongoose) on the API, and a shared package for domain constants and response types.

> **Status: Phase 1 (Foundation) complete.** The project runs end to end: validated configuration, a database-backed API with health and readiness endpoints, the design system, and a web app that calls the API. Authentication, jobs, applications, billing and dashboards are built in later phases. See [Roadmap](#roadmap).

---

## Contents

- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment configuration](#environment-configuration)
- [Scripts](#scripts)
- [Architecture notes](#architecture-notes)
- [Design system](#design-system)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Security notes](#security-notes)

---

## Repository layout

```
hireloop/
  apps/
    api/        Express + Mongoose API (TypeScript)
    web/        React + Vite web app (TypeScript, Tailwind CSS v4)
  packages/
    shared/     Domain constants, Zod pagination schema, API response types
  .env.example  Every environment variable, documented
  tsconfig.base.json, eslint.config.js, .prettierrc.json
```

The API is organised by domain as it grows. Controllers stay thin, services hold business logic, and request validation lives next to each feature.

## Prerequisites

| Tool    | Version           | Notes                                    |
| ------- | ----------------- | ---------------------------------------- |
| Node.js | **22.9 or later** | Required for `--env-file-if-exists`      |
| npm     | 10 or later       | Workspaces are used                      |
| MongoDB | 6.0 or later      | Local `mongod`, Docker, or MongoDB Atlas |

## Quick start

```bash
# 1. Install every workspace
npm install

# 2. Create the API environment file and fill in the required values
cp .env.example apps/api/.env
#    Generate three different secrets (each at least 32 characters):
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# 3. Start MongoDB, then set MONGODB_URI in apps/api/.env, for example:
#    MONGODB_URI=mongodb://127.0.0.1:27017/hireloop

# 4. Run the API, the web app and the shared package watcher together
npm run dev
```

Then open:

- Web app: <http://localhost:5173>
- API health: <http://localhost:5173/api/v1/health> (proxied through Vite) or <http://localhost:4000/api/v1/health>
- API readiness (checks the database): <http://localhost:4000/api/v1/ready>

In development the Vite server proxies `/api` to the API, so cookies stay same-origin once authentication arrives in Phase 2.

### Production-style run

```bash
npm run build                 # shared, API and web
npm run start                 # runs apps/api/dist/server.js
# Serve apps/web/dist with any static host, or run: npm run preview -w @hireloop/web
```

## Environment configuration

The API validates its environment at startup with Zod (`apps/api/src/config/env.ts`). If anything is missing or malformed, the process exits with one message that lists every problem. It does not fail later in a confusing way.

| Variable               | Required                   | Purpose                                                                  |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `NODE_ENV`             | No (default `development`) | `development`, `test` or `production`. Production requires `https` URLs. |
| `PORT`                 | No (default `4000`)        | API port                                                                 |
| `WEB_URL`              | **Yes**                    | Public web origin. Also the only CORS origin allowed.                    |
| `API_URL`              | **Yes**                    | Public API origin                                                        |
| `MONGODB_URI`          | **Yes**                    | Must start with `mongodb://` or `mongodb+srv://`                         |
| `TRUST_PROXY`          | No (default `0`)           | Reverse-proxy hops, so client IPs are correct for rate limiting          |
| `SESSION_SECRET`       | **Yes**                    | At least 32 characters. Must differ from the other two secrets.          |
| `ACCESS_TOKEN_SECRET`  | **Yes**                    | At least 32 characters. Used from Phase 2.                               |
| `REFRESH_TOKEN_SECRET` | **Yes**                    | At least 32 characters. Used from Phase 2.                               |
| `LOG_LEVEL`            | No (default `info`)        | `fatal` to `trace`, or `silent`                                          |

| `EMAIL_PROVIDER` | No (default `console`) | `console` prints emails to the terminal (development only). `resend` sends through Resend and is required in production. |
| `EMAIL_API_KEY` | With `resend` | Resend API key |
| `EMAIL_FROM` | No | Sender address, for example `HireLoop <no-reply@yourdomain>` |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client. Set all three Google variables together, or none. |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Optional | Must match the redirect URI registered with Google, for example `http://localhost:4000/api/v1/auth/google/callback` |

Storage and Stripe variables are listed in `.env.example` and are not read until their phases. The admin bootstrap variables (`ADMIN_EMAIL`, `ADMIN_FULL_NAME`, `ADMIN_PASSWORD`) are read only by the bootstrap script.

## Authentication (Phase 2)

**Session model.** Sign-in issues a short-lived access JWT (15 minutes) in the HTTP-only cookie `hl_access`, plus a refresh value in `hl_refresh`, which is scoped to `/api/v1/auth`. The refresh value is `<sessionId>.<secret>`. Only a SHA-256 hash of the secret is stored. Each refresh rotates the secret. Presenting an old secret is treated as theft: the session is revoked. Every protected request checks that the session is still active and that the user is still active, so logout and suspension take effect immediately.

**CSRF.** The API reads the readable cookie `hl_csrf`. Unsafe requests that carry auth cookies must send the same value in the `X-CSRF-Token` header. Any request with an `Origin` header that is not the web app or the API is refused.

**Account enumeration.** Registration, resend-verification, forgot-password and sign-in return the same response whether or not the account exists. Registration and sign-in run a bcrypt comparison either way, so timing does not reveal accounts.

**Google.** Start at `GET /api/v1/auth/google?role=seeker|recruiter&next=/path`. The state and nonce are carried in a signed, 10-minute cookie. The ID token nonce is verified. An existing password account is linked to Google only when Google reports the email as verified.

**Endpoints** (all under `/api/v1/auth`): `POST register`, `verify-email`, `resend-verification`, `login`, `refresh`, `logout`, `forgot-password`, `reset-password`, `change-password`; `GET me`, `google`, `google/callback`.

**Admin** (under `/api/v1/admin`, admin role only): `PATCH users/:id/status` and `PUT users/:id/roles`. Every change is written to the `AuditLog` collection. An admin cannot suspend or demote themselves, and the last active admin cannot be removed. Admin accounts cannot be created by self-registration.

**Creating the first admin:**

```bash
ADMIN_EMAIL=you@example.com ADMIN_FULL_NAME="Your Name" \
ADMIN_PASSWORD='a long passphrase 1' npm run bootstrap:admin
```

The script is idempotent. If the user already exists, it adds the admin role and leaves the password unchanged.

**Tests.** The unit suite covers password hashing, token signing and tampering, the OAuth state cookie, safe redirect paths, CSRF, role checks, and template escaping. `auth.integration.test.ts` covers the full flow against a real MongoDB: registration, verification, login, refresh rotation, reuse detection, suspension, and the generic responses. It runs only when `TEST_MONGODB_URI` is set, and it drops that database first, so point it at a disposable database only.

```bash
TEST_MONGODB_URI=mongodb://127.0.0.1:27017/hireloop_test npm run test -w @hireloop/api
```

**Known limits in this phase.** Profile completion, account self-deactivation, company approval and subscription entitlements belong to Phases 3 and 5. The admin console UI is Phase 6.

Never commit real secrets. `.env` and `.env.*` are ignored by git. Only `.env.example` is tracked.

## Scripts

- `npm run bootstrap:admin -w @hireloop/api`: creates the first administrator from environment variables (see Authentication).

Run from the repository root unless stated otherwise.

| Command                                   | What it does                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`                             | Builds the shared package, then runs its watcher, the API and the web app |
| `npm run build`                           | Production build of shared, API and web                                   |
| `npm run start`                           | Runs the compiled API                                                     |
| `npm run typecheck`                       | Strict TypeScript check of every package                                  |
| `npm run test`                            | Runs the API and web test suites                                          |
| `npm run lint`                            | ESLint across the repository                                              |
| `npm run format` / `npm run format:check` | Prettier write / verify                                                   |

Workspace-specific commands: `npm run test:watch -w @hireloop/api`, `npm run dev -w @hireloop/web`.

## Architecture notes

**Response envelope.** Every API response uses one shape, defined in `@hireloop/shared`:

```jsonc
// success
{ "success": true, "data": { ... }, "meta": { "requestId": "..." } }
// failure
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] }, "meta": { "requestId": "..." } }
```

Error codes are a fixed set (`VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, and others). Unexpected errors are logged in full on the server and returned to the client as a generic message, with no stack trace.

**Request IDs.** Each request gets an `X-Request-Id` header. A client-supplied ID is accepted only when it matches a safe pattern, which prevents log injection.

**Logging.** Structured JSON through Pino. Cookies, authorization headers and password or token fields are redacted.

**Security headers and CORS.** Helmet sets a restrictive Content Security Policy for the JSON API. CORS allows only `WEB_URL`, with credentials enabled. Wildcard origins are never used. Request bodies are limited to 100 KB.

**Health and readiness.** `/api/v1/health` is a liveness check and never touches the database. `/api/v1/ready` returns `503` until MongoDB is connected. The server refuses to start if the database cannot be reached on boot.

**Shared package.** `@hireloop/shared` holds role, status and plan enumerations, the pagination schema and the response types. The API models and the web app import the same values, so they cannot drift apart. It must be built before the API or web app run, which `npm run dev` does automatically.

## Design system

Tokens live in `apps/web/src/styles/index.css`:

- **Raw palette** (`--hl-*`) changes between light and dark mode.
- **Tailwind theme** (`bg-background`, `text-brand`, `text-muted-foreground`, and so on) points at the raw palette. Components never hardcode colours.
- Typography: **Sora** for headings, **Manrope** for body text.
- Dark mode follows the operating system by default. The choice (light, dark or system) persists in local storage and is applied before first paint, so there is no flash.
- `prefers-reduced-motion` is respected globally.

Reusable components are in `apps/web/src/components/ui` and are exported from one barrel. They include Button, the form controls (Input, Textarea, Select, Checkbox, RadioGroup, FormField), Modal, Drawer, ConfirmDialog, Dropdown, Tooltip, Badge, StatusIndicator, Avatar, Skeleton, EmptyState, ErrorState, Pagination, SearchBar and StatCard.

Open **/design-system** in the running app to see every component in light and dark mode.

Dialogs, dropdowns, tooltips, checkboxes and radio groups use Radix primitives, which provide focus management, keyboard support and ARIA roles.

## Testing

```bash
npm run test -w @hireloop/api   # Vitest + Supertest
npm run test -w @hireloop/web   # Vitest + Testing Library (jsdom)
```

Current coverage (Phase 1):

- **API:** environment validation (missing, short, duplicate and malformed values; production HTTPS rules), the health and readiness endpoints, request-ID handling, structured 404s, malformed and oversized bodies, security headers, and the CORS allow-list.
- **Web:** the Button and FormField components (labels, ARIA error linkage, loading state) and the theme resolution logic.

Playwright end-to-end tests and the authorization, billing and business-rule suites begin in later phases, as the features they cover are built.

## Troubleshooting

**`Invalid environment configuration` on start.** The message lists each variable to fix. Check that `apps/api/.env` exists, that the secrets are at least 32 characters, and that the three secrets differ.

**`Could not connect to MongoDB`.** The API exits at start-up when the database is unreachable. Check that `mongod` is running, that `MONGODB_URI` is correct, and that Atlas network access allows your IP.

**`/api/v1/ready` returns 503.** The API is running but the database connection is not ready. Check the API logs.

**The web app shows "API unreachable".** Start the API (`npm run dev` starts it), then retry. The Vite proxy targets `http://localhost:4000` by default.

**`--env-file-if-exists` is not recognised.** Upgrade Node.js to 22.9 or later.

## Roadmap

| Phase | Scope                                                                                                                  | Status                                                         |
| ----- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1     | Foundation: monorepo, config, database, design system, shared components                                               | **Complete**                                                   |
| 2     | Authentication and authorization: users, roles, sessions, Google OAuth, email verification, password reset, middleware | **Complete (backend integration tests pending a MongoDB run)** |
| 3     | Profiles, companies and jobs: uploads, company moderation, job publishing, public pages                                | Planned                                                        |
| 4     | Applications: submissions, saved jobs, status workflow, notifications                                                  | Planned                                                        |
| 5     | Subscriptions and payments: Stripe Checkout, verified webhooks, entitlements                                           | Planned                                                        |
| 6     | Dashboards and analytics: seeker, recruiter and admin dashboards, exports                                              | Planned                                                        |
| 7     | Quality and launch: seed data, end-to-end tests, SEO, monitoring, deployment                                           | Planned                                                        |

Components from the specification that depend on domain data are deferred to the phase that needs them, rather than built empty. These are DataTable, FilterBar, ChartCard, JobCard, CompanyCard, PricingCard, ApplicantCard, CompanyLogo, NotificationDropdown, ProfileMenu and DashboardSidebar.

## Security notes

- Configuration is validated at startup. Secrets come only from environment variables.
- The API uses an explicit CORS allow-list, strict security headers, a request body limit and rate limiting. Stricter limits for sign-in and uploads arrive in Phase 2 and Phase 3.
- Production requires HTTPS for both public URLs.
- Logs redact authorization headers, cookies, passwords and tokens.
- Dependencies were checked with `npm audit --omit=dev`, which reports zero known vulnerabilities at the end of Phase 1.
- Authentication cookies, CSRF protection and the authorization middleware are the first items of Phase 2. Nothing in Phase 1 stores user data or grants access to anything.
