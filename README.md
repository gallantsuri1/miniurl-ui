# MyURL React Frontend

A modern React.js + Material-UI (MUI) frontend for the MyURL URL shortener application.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:3000`

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
| Settings | `/settings` | `SETTINGS_PAGE` | Change password, export data, delete account |

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

## Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123# | ADMIN |
| user | user123 | USER |

## API Integration

### Initialization Flow

When the app loads or refreshes:

1. **Health Check** → `GET /api/health`
   - If unhealthy → Show "Under Maintenance" page (auto-retries every 20 seconds)
   - If healthy → Continue

2. **Feature Loading** → `GET /api/features` (if token exists)
   - If 401 → Clear token, mark as not authenticated
   - If 200 → Load features, mark as authenticated

3. **Route Resolution**
   - If not authenticated → Redirect to `/login`
   - If no feature access → Redirect to `/no-permission`
   - If authenticated with access → Load target page

### Feature Flags

The application uses feature flags to control page access. Features are loaded from the backend after initialization:

| Feature Key | Feature Name | Controls |
|-------------|--------------|----------|
| `DASHBOARD` | Dashboard | Dashboard page access |
| `PROFILE_PAGE` | Profile Page | Profile page access |
| `SETTINGS_PAGE` | Settings Page | Settings page access |
| `URL_SHORTENING` | URL Shortening | Shorten button visibility |
| `EXPORT_JSON` | Export to JSON | Export data button in Settings |
| `USER_MANAGEMENT` | User Management | User Management page (Admin) |
| `EMAIL_INVITE` | Email Invitations | Email Invites page (Admin) |
| `FEATURE_MANAGEMENT` | Feature Management | Feature Flags page (Admin) |
| `USER_SIGNUP` | User Sign Up | User registration (Global) |

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
├── types/                    # TypeScript type definitions
│   └── index.ts
└── utils/                    # Utility functions
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

### 5. User Management (Admin)
- View all users with pagination
- Search by name, email, username
- Filter by status (Active, Suspended, Deleted)
- Sort by created date
- Suspend/activate users
- User statistics cards

### 6. Email Invitations (Admin)
- Send email invitations
- View invitation history with pagination
- Filter by status (Pending, Accepted, Revoked, Expired)
- Search by email
- Revoke pending invitations
- Resend revoked/expired invitations
- Invitation statistics cards

### 7. Feature Flags (Admin)
- View all features in organized sections (Role-Based and Global)
- Toggle features on/off per role (Admin/User)
- Add new features with Admin/User toggles
- Delete features with confirmation
- Real-time feature status updates

### 8. Self Signup
- Request access via email (when USER_SIGNUP global feature enabled)
- Email validation
- Calls `/api/self-invite/send` endpoint
- Success confirmation with sign-in link

### 9. Password Reset
- Forgot password page with email input
- Reset password page with token validation
- New password with confirmation
- Success confirmation with sign-in link

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

### Vite Configuration
- `appType: 'spa'` - Enables SPA mode
- `configureServer` middleware - Handles client-side routing
- Proxy configuration - Routes `/api/*` to backend
- All other routes serve `index.html`

### Context Providers
- `HealthProvider` - Monitors API health
- `InitializationProvider` - Orchestrates app initialization
- `AuthProvider` - Manages authentication state
- `FeatureProvider` - Manages feature flags

### Error Handling
- Network errors (502/503/504) → Maintenance page
- 401 errors → Clear token and redirect to login
- 403 errors → Show "Access forbidden" message
- Loading states during all async operations

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

**For GitHub Container Registry:**
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

#### 4. Access the Application
```
http://your-server-ip
```

#### 5. Update to New Version
```bash
# Stop and remove old container
docker stop miniurl-ui
docker rm miniurl-ui

# Pull new image
docker pull gallantsuri1/miniurl-ui:v1.1.0

# Run with new version
docker run -d \
  --name miniurl-ui \
  -p 80:80 \
  -e VITE_API_URL="https://prod-api.example.com" \
  --restart unless-stopped \
  gallantsuri1/miniurl-ui:v1.1.0
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

> **How it works:** The Docker image creates a `config.js` file at container startup with your environment variables from `docker-compose.yml` or `docker run -e`. The app reads `window.__APP_CONFIG__` at runtime, allowing you to **use a single image** across dev, staging, and production — no rebuild needed.

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

---

## Sample Code

### Java - Send Email Invitation

A sample Java program is included (`SendEmailInvite.java`) to demonstrate how to send email invitations via the API:

```bash
# Compile and run
javac SendEmailInvite.java
java SendEmailInvite
```

The sample demonstrates:
- JWT authentication
- API request with query parameters
- Error handling

## License

MIT
