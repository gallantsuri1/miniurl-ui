# MyURL React Frontend

A modern React.js + Material-UI (MUI) frontend for the MyURL URL shortener application.

## Setup Instructions

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Backend API | Running at `http://localhost:8080` (or your `VITE_API_URL`) |

### Step 1 — Install Dependencies

```bash
npm install
```

### Step 2 — Configure Environment

Copy the example env file and edit as needed:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_APP_NAME` | Application name | No (default: `MyURL`) |
| `VITE_APP_DESCRIPTION` | Application subtitle | No (default: `Amazon of URL's`) |
| `VITE_API_URL` | Backend API URL | No (default: `http://localhost:8080`) |

### Step 3 — Start the Development Server

```bash
npm run dev
```

The app will be available at **`http://localhost:3000`**. It will proxy `/api/*` requests to your backend.

### Step 4 — Run Tests (Optional)

**Unit / Integration tests:**
```bash
npm test          # Run once
npm run test:watch # Watch mode
```

**End-to-End tests (Playwright):**

E2E tests require two user accounts on your backend. Set credentials via env vars:

```bash
E2E_ADMIN_USERNAME=admin \
E2E_ADMIN_PASSWORD=your-admin-password \
E2E_USER_USERNAME=user \
E2E_USER_PASSWORD=your-user-password \
npm run e2e
```

Or create an `.env.e2e` file:
```bash
E2E_ADMIN_USERNAME=admin
E2E_ADMIN_PASSWORD=your-admin-password
E2E_USER_USERNAME=user
E2E_USER_PASSWORD=your-user-password
```

Then run:
```bash
npm run e2e          # Headless
npm run e2e:ui       # Interactive UI
npm run e2e:headed   # Visible browser
npm run e2e:debug    # Step-by-step debug
npm run e2e:report   # View HTML report
```

### Step 5 — Build for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

---

## Quick Start (TL;DR)

```bash
npm install
cp .env.example .env   # edit if needed
npm run dev            # → http://localhost:3000
```

## Features

- **Modern UI**: Built with React 18 and Material-UI (MUI) v5
- **TypeScript**: Full TypeScript support for type safety
- **Responsive Design**: Mobile-first responsive layout
- **JWT Authentication**: Secure authentication with token management
- **Feature Flags**: Page access controlled by backend feature flags
- **Protected Routes**: Route protection based on authentication and feature permissions
- **Configurable**: Environment-based configuration for app name and API URL
- **Health Check**: Automatic API health monitoring with maintenance page
- **SPA Routing**: Client-side routing with proper page refresh support
- **Auto Maintenance Mode**: Redirects to maintenance page when API is unavailable
- **Comprehensive Validation**: Client-side and server-side validation on all forms with zero layout shift

## Pages

### System Pages
| Page | Route | Description |
|------|-------|-------------|
| Under Maintenance | `/` (when API down) | Shows when backend API is unreachable, auto-retries every 20 seconds |
| Loading | `/` (initial) | Shows while checking API health and loading features |

### Public Pages
| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | User authentication with username/email + password |
| Self Signup | `/self-signup` | Request access via email (when USER_SIGNUP enabled) |
| Forgot Password | `/forgot-password` | Request password reset link |
| Reset Password | `/reset-password?token=...` | Reset password with token |

### Authenticated Pages
| Page | Route | Feature Flag | Description |
|------|-------|--------------|-------------|
| Dashboard | `/dashboard` | `DASHBOARD` | Create and manage shortened URLs with pagination, search, and sorting |
| Profile | `/profile` | `PROFILE_PAGE` | View and edit profile information |
| Settings | `/settings` | `SETTINGS_PAGE` | Manage theme appearance, export data, change password, delete account |

### Admin Pages (Feature-Gated)
| Page | Route | Feature Flag | Description |
|------|-------|--------------|-------------|
| User Management | `/admin/users` | `USER_MANAGEMENT` | View, suspend, activate users with pagination, search, and status filter |
| Email Invitations | `/admin/email-invites` | `EMAIL_INVITE` | Manage email invitations with send, revoke, resend functionality |
| Feature Flags | `/admin/features` | `FEATURE_MANAGEMENT` | Toggle application features on/off |

### Error Pages
| Page | Route | Description |
|------|-------|-------------|
| No Permission | `/no-permission` | Access denied page for users without feature access |

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
VITE_APP_NAME=MyURL
VITE_APP_DESCRIPTION=Amazon of URL's
VITE_API_URL=http://localhost:8080
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_NAME` | Application name displayed in UI | `MyURL` |
| `VITE_APP_DESCRIPTION` | Application subtitle/description | `Amazon of URL's` |
| `VITE_API_URL` | Backend API base URL | `http://localhost:8080` |

## Default Test Accounts

E2E tests require two user accounts. Configure their credentials via environment variables:

| Variable | Description |
|----------|-------------|
| `E2E_ADMIN_USERNAME` | Admin username for E2E tests |
| `E2E_ADMIN_PASSWORD` | Admin password for E2E tests |
| `E2E_USER_USERNAME` | Regular user username for E2E tests |
| `E2E_USER_PASSWORD` | Regular user password for E2E tests |

Example `.env.e2e`:
```bash
E2E_ADMIN_USERNAME=admin
E2E_ADMIN_PASSWORD=your-admin-password
E2E_USER_USERNAME=user
E2E_USER_PASSWORD=your-user-password
```

Run E2E tests with credentials:
```bash
E2E_ADMIN_USERNAME=admin E2E_ADMIN_PASSWORD=secret npm run e2e
```

## Form Validation

All forms implement strict client-side validation that matches the backend API rules. Errors appear as tooltips above each field — no layout shift occurs when validation messages appear or disappear.

### Validation Behavior
- **On blur**: Each field validates when the user tabs away or clicks outside
- **On submit**: All fields validate simultaneously; invalid fields show tooltips
- **Server errors**: API 400 responses are parsed and displayed in the existing error banner
- **Submit button**: Disabled while validation errors exist (where applicable)

### Field Rules

#### Signup (`/signup?invite=...`)
| Field | Required | Min | Max | Pattern | Error |
|-------|----------|-----|-----|---------|-------|
| First Name | Yes | 1 | 100 | `^[\p{L}\s'\-]+$` | Letters, spaces, hyphens, apostrophes only |
| Last Name | Yes | 1 | 100 | `^[\p{L}\s'\-]+$` | Letters, spaces, hyphens, apostrophes only |
| Username | Yes | 3 | 50 | `^[a-zA-Z][a-zA-Z0-9_]*$` | Starts with letter, then letters/numbers/underscores |
| Password | Yes | 8 | 255 | — | At least 8 characters |
| Invitation Token | Yes | — | — | — | From URL query param |

#### Login (`/login`)
| Field | Required | Error |
|-------|----------|-------|
| Username or Email | Yes | Required |
| Password | Yes | Required |

#### OTP Verification (`/verify-otp`)
| Field | Required | Rule | Error |
|-------|----------|------|-------|
| Username | Yes (from state) | — | Required |
| OTP | Yes | `^[0-9]{6}$` | Exactly 6 digits |

#### Forgot Password (`/forgot-password`)
| Field | Required | Rule | Error |
|-------|----------|------|-------|
| Email | Yes | Valid email format | Must be a valid email address |

#### Reset Password (`/reset-password?token=...`)
| Field | Required | Min | Max | Error |
|-------|----------|-----|-----|-------|
| Token | Yes | — | — | From URL query param |
| New Password | Yes | 8 | 255 | At least 8 characters |
| Confirm Password | Yes | — | — | Must match new password |

#### Change Password (`/settings`)
| Field | Required | Min | Max | Error |
|-------|----------|-----|-----|-------|
| Current Password | Yes | — | — | Required |
| New Password | Yes | 8 | 255 | At least 8 characters |
| Confirm New Password | Yes | — | — | Must match new password |

#### Update Profile (`/profile`)
| Field | Required | Max | Pattern | Error |
|-------|----------|-----|---------|-------|
| First Name | No | 100 | `^[\p{L}\s'\-]*$` | Letters, spaces, hyphens, apostrophes only |
| Last Name | No | 100 | `^[\p{L}\s'\-]*$` | Letters, spaces, hyphens, apostrophes only |
| Email | No | 255 | Valid email format | Must be a valid email address |
| Theme | No | — | `LIGHT, DARK, OCEAN, FOREST` | Must be a valid theme name |

#### Delete Account (`/settings` → dialog)
| Field | Required | Min | Error |
|-------|----------|-----|-------|
| Password | Yes | 8 | At least 8 characters |

#### Create Short URL (`/dashboard`)
| Field | Required | Min | Max | Pattern | Error |
|-------|----------|-----|-----|---------|-------|
| URL | Yes | — | 2000 | `^[^\s]+$` | No spaces, must be valid URL |
| Custom Alias | No | 3 | 10 | `^[a-zA-Z0-9]+$` | Alphanumeric only |

### Server-Side Error Handling

When the API returns a 400 response, the error message is parsed and displayed:

```json
{
  "success": false,
  "message": "Validation failed: Alias must be between 3 and 10 characters, Alias must contain only alphanumeric characters"
}
```

Server validation messages are displayed in the form's existing error alert banner without any layout shift.

## Project Structure

```
src/
├── components/               # Reusable UI components
│   ├── Header.tsx            # Top navigation header
│   ├── Navigation.tsx        # Navigation drawer
│   ├── ProtectedRoute.tsx    # Route protection wrapper
│   └── SignupGuard.tsx       # Signup feature guard
├── config/                   # Application configuration
│   └── index.ts              # Environment variables & API endpoints
├── context/                  # React context providers
│   ├── AuthContext.tsx       # Authentication state management
│   ├── FeatureContext.tsx    # Feature flags state management
│   ├── HealthContext.tsx     # API health check state management
│   └── InitializationContext.tsx # App initialization orchestration
├── pages/                    # Page components
│   ├── admin/                # Admin pages
│   │   ├── UserManagementPage.tsx
│   │   ├── FeatureFlagsPage.tsx
│   │   └── EmailInvitesPage.tsx
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── SelfSignupPage.tsx
│   ├── SignupPage.tsx
│   ├── OtpVerifyPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── ProfilePage.tsx
│   ├── SettingsPage.tsx
│   ├── NoPermissionPage.tsx
│   └── UnderMaintenancePage.tsx
├── services/                 # API service layer
│   ├── api.ts                # Axios instance configuration
│   ├── authService.ts        # Authentication API calls
│   ├── urlService.ts         # URL management API calls
│   ├── profileService.ts     # Profile API calls
│   ├── settingsService.ts    # Settings API calls
│   ├── adminService.ts       # Admin API calls
│   ├── featureService.ts     # Feature flags API calls
│   ├── emailInviteService.ts # Email invites API calls
│   ├── selfInviteService.ts  # Self-invitation API calls
│   └── healthService.ts      # Health check API calls
├── test/                     # Test setup and mocks
│   └── setup.tsx             # Global test configuration
├── types/                    # TypeScript type definitions
│   └── index.ts
└── utils/                    # Utility functions
    └── validation.ts         # Centralized form validation rules
```

## Key Features

### 1. API Health Monitoring
- Checks `/api/health` endpoint before loading the app
- Shows "Under Maintenance" page if API is unreachable
- Auto-retries every 20 seconds with countdown timer
- Manual "Check Now" button available
- Automatically reloads app when service is restored
- **API failure during session** → Auto-redirects to maintenance page

### 2. Feature-Based Access Control
- All pages (except login) are protected by feature flags
- Users are redirected based on their feature permissions
- No Permission page auto-redirects if user gains access
- Feature names displayed in UI come from backend API

### 3. SPA Routing
- Vite configured to serve `index.html` for all non-API routes
- API requests (`/api/*`) proxied to backend
- Frontend routes (`/admin/*`, `/dashboard`, etc.) handled by React Router
- Page refresh works correctly on all routes

### 4. Dashboard Features
- Create short URLs with custom aliases
- URL list with search functionality
- Pagination with MUI TablePagination (5, 10, 20, 50 per page)
- Sort by clicks and created date
- Copy short URL to clipboard
- Delete URLs with confirmation
- URL creation limits display (per minute, per day, per month)
- Optimized table column widths

### 5. Zero Layout Shift on Validation Errors
- All validation errors display as tooltips above the field (not below)
- Tooltips use MUI `Tooltip` with `placement="top"` and `arrow`
- Error state shown via red border on the field — no extra space consumed
- When error is cleared, tooltip disappears — field height remains unchanged
- Form-level error alerts (server 400 responses) use existing Alert banners

### 6. Centralized Validation
- All validation rules live in `src/utils/validation.ts`
- Regex patterns, length constraints, and validator functions in one place
- Reused across all pages for consistency
- Easy to update when backend rules change

### 7. Testing
- **Unit & Integration Tests**: Vitest + React Testing Library + JSDOM
  - Unit tests for all validation functions (`src/utils/validation.test.ts`)
  - Integration tests for form interactions across all pages
  - Run with `npm test` (single run) or `npm run test:watch` (watch mode)

### 8. End-to-End Testing
- **Playwright** — Real browser E2E tests covering critical user flows
  - **Login** — Valid/invalid credentials, OTP flow
  - **Forgot Password** — Email submission and server response
  - **Reset Password** — Token-based password reset flow
  - **Dashboard** — URL creation, listing, search, pagination
  - **URL Management** — Create, delete, copy URLs with validation
  - **Profile** — View and update profile information
  - **Settings** — Change password, theme switching
  - **Protected Routes** — Auth guards and access control
  - **Navigation** — Sidebar and header navigation

  ```bash
  # Run all E2E tests (headless)
  npm run e2e

  # Run with interactive UI
  npm run e2e:ui

  # Run headed (visible browser)
  npm run e2e:headed

  # Debug a specific test
  npm run e2e:debug

  # View HTML test report
  npm run e2e:report
  ```

  E2E tests live in `e2e/` and use Playwright with Chromium. Tests auto-start the dev server and run against `http://localhost:3000` by default (override with `BASE_URL` env var).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit/integration tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run e2e` | Run Playwright E2E tests (headless) |
| `npm run e2e:ui` | Run E2E tests with interactive UI |
| `npm run e2e:headed` | Run E2E tests with visible browser |
| `npm run e2e:debug` | Debug E2E tests step-by-step |
| `npm run e2e:report` | View E2E test HTML report |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

# Production Deployment with Docker

## Prerequisites

- Docker installed on your machine
- Docker account (Docker Hub or GitHub Container Registry)
- Backend API running at `https://api.example.com`
- Domain name pointing to your server (e.g., `ui.example.com`)

---

## Part 1: Publish Docker Image

### Option A: Docker Hub

#### 1. Login to Docker Hub
```bash
docker login
```

#### 2. Build the Image (Cross-Platform: macOS + Linux)
```bash
# Build for both AMD64 (Intel) and ARM64 (Apple Silicon / ARM servers)
# No build-args needed — env vars are injected at runtime via docker-compose
docker buildx build --platform linux/amd64,linux/arm64 \
  --push \
  -t gallantsuri1/miniurl-ui:v1.0.0 .
```

> **Note:** The `--push` flag automatically pushes to Docker Hub after building (required for multi-platform images). If you only need your local machine, omit `--platform` and `--push`:
> ```bash
> docker build -t gallantsuri1/miniurl-ui:v1.0.0 .
> ```

#### 3. Verify the Pushed Image
```bash
# Check the manifest to see supported platforms
docker buildx imagetools inspect gallantsuri1/miniurl-ui:v1.0.0
```

### Option B: GitHub Container Registry (GHCR)

#### 1. Generate a GitHub Personal Access Token
Go to **Settings → Developer settings → Personal access tokens → Tokens (classic)**
- Select scopes: `write:packages`, `read:packages`
- Copy the token

#### 2. Login to GHCR
```bash
echo $CR_PAT | docker login ghcr.io -u gallantsuri1 --password-stdin
```

#### 3. Build and Tag (Cross-Platform)
```bash
docker buildx build --platform linux/amd64,linux/arm64 \
  --push \
  -t ghcr.io/gallantsuri1/miniurl-ui:v1.0.0 .
```

#### 4. Verify the Pushed Image
```bash
docker buildx imagetools inspect ghcr.io/gallantsuri1/miniurl-ui:v1.0.0
```

---

## Part 2: Deploy Using Published Image

### Option A: Docker Compose (Recommended)

#### 1. Create `.env` file
```bash
# UI Port (host mapping)
UI_PORT=80

# Runtime environment variables (injected into the container at startup)
VITE_APP_NAME=MyURL
VITE_APP_DESCRIPTION=Amazon of URL's
VITE_API_URL=https://api.suricloud.uk
```

#### 2. Create `docker-compose.yml`

**For Docker Hub:**
```yaml
version: '3.8'

services:
  miniurl-ui:
    image: gallantsuri1/miniurl-ui:v1.0.0
    ports:
      - "${UI_PORT:-80}:80"
    environment:
      - VITE_APP_NAME=${VITE_APP_NAME:-MyURL}
      - VITE_APP_DESCRIPTION=${VITE_APP_DESCRIPTION:-Amazon of URL's}
      - VITE_API_URL=${VITE_API_URL:-http://localhost:8080}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

#### 3. Pull and Start
```bash
# Pull the image
docker compose pull

# Start the container
docker compose up -d
```

#### 4. Access the Application
```
http://your-server-ip
```

### Option B: Direct Docker Run

No `docker-compose.yml` needed — just run the container directly.

#### 1. Pull and Run
```bash
docker run -d \
  --name miniurl-ui \
  -p 80:80 \
  --restart unless-stopped \
  gallantsuri1/miniurl-ui:v1.0.0
```

#### 2. Override Environment Variables at Runtime

The image supports runtime environment variable substitution. You can override `VITE_APP_NAME`, `VITE_APP_DESCRIPTION`, and `VITE_API_URL` at container start without rebuilding:

```bash
docker run -d \
  --name miniurl-ui \
  -p 80:80 \
  -e VITE_APP_NAME="MyCustomApp" \
  -e VITE_APP_DESCRIPTION="Custom URL Shortener" \
  -e VITE_API_URL="https://prod-api.example.com" \
  --restart unless-stopped \
  gallantsuri1/miniurl-ui:v1.0.0
```

> **How it works:** The Docker image injects runtime environment variables by creating a `config.js` file at container startup. The app reads `window.__APP_CONFIG__` before falling back to Vite build-time env vars. This means you can **use a single image** across dev, staging, and production by just changing environment variables at runtime — no `sed` on minified JS.

#### 3. Verify
```bash
# Check container status
docker ps

# View logs (should show substitution confirmation)
docker logs -f miniurl-ui

# Test health endpoint
curl http://localhost:80
```

---

## Part 3: Versioning & Updates

### Versioning Best Practices
Use semantic versioning tags instead of `latest` for production:

```bash
# Build with version tag (multi-platform + auto-push)
docker buildx build --platform linux/amd64,linux/arm64 \
  --push \
  -t gallantsuri1/miniurl-ui:1.0.0 \
  -t gallantsuri1/miniurl-ui:latest .
```

### Updating to a New Version
```bash
# Update version in docker-compose.yml
# Then pull and restart
docker compose pull
docker compose up -d

# Remove old unused images
docker image prune -f
```

---

## Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_APP_NAME` | Application name | `MyURL` | `MyURLShortener` |
| `VITE_APP_DESCRIPTION` | Application subtitle | `Amazon of URL's` | `Your URL Shortener` |
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` | `https://api.example.com` |
| `UI_PORT` | Host port mapping | `80` | `3000` |

## Production Checklist

- [ ] Set `VITE_API_URL` to production backend (`https://api.example.com`)
- [ ] Configure SSL/TLS certificates
- [ ] Set up domain DNS records
- [ ] Configure firewall rules (ports 80, 443)
- [ ] Enable Docker auto-restart on server reboot
- [ ] Set up log rotation
- [ ] Configure monitoring/alerting
- [ ] Test health endpoint: `curl http://your-domain/`
- [ ] Verify backend connectivity

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs miniurl-ui

# Rebuild with no cache
docker-compose build --no-cache
```

### Cannot connect to backend
```bash
# Verify backend URL is accessible
curl https://api.example.com/api/health

# Check container network
docker network ls
docker inspect miniurl-ui
```

### SSL Certificate Issues
```bash
# Verify certificates
openssl x509 -in ssl/cert.pem -text -noout

# Check certificate expiry
openssl x509 -enddate -noout -in ssl/cert.pem
```

## Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Verify
docker-compose ps
curl http://your-domain/
```

---

## CI/CD: Automated Docker Release

The project includes a GitHub Actions workflow that automatically builds and publishes Docker images when you create a release on GitHub.

### Setup (One-Time)

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Add these repository secrets:

   | Secret | Value |
   |---|---|
   | `DOCKER_USER` | `gallantsuri1` |
   | `DOCKER_API_TOKEN` | Your Docker Hub [personal access token](https://app.docker.com/settings/personal-access-tokens) |

### How to Trigger a Release

#### Step 1: Create and push a tag (triggers automatically)
```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

> That's it! The workflow triggers automatically on tag push. No need to create a release through the GitHub UI.

#### What the workflow does:
- ✅ Build multi-platform Docker image (`linux/amd64` + `linux/arm64`)
- ✅ Push to Docker Hub as `gallantsuri1/miniurl-ui:v1.1.0` and `gallantsuri1/miniurl-ui:latest`
- ✅ Create a notification issue assigned to you (GitHub emails you automatically)

#### Step 2: Deploy the new version
```bash
# On your server
cd ~/miniurl-ui
docker compose pull
docker compose up -d
```

## License

MIT
