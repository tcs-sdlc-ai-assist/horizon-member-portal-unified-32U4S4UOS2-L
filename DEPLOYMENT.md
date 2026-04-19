# Deployment Guide

> Complete deployment documentation for the Horizon Member Portal — Vercel deployment steps, environment configuration, security headers, CI/CD integration, and production checklist.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Variable Configuration](#environment-variable-configuration)
- [Vercel Deployment](#vercel-deployment)
  - [Initial Setup](#initial-setup)
  - [vercel.json Configuration Explained](#verceljson-configuration-explained)
  - [SPA Rewrite Setup](#spa-rewrite-setup)
  - [Security Headers](#security-headers)
  - [Cache Control](#cache-control)
- [CI/CD Integration](#cicd-integration)
  - [GitHub Integration](#github-integration)
  - [Preview Deployments](#preview-deployments)
  - [Production Deployments](#production-deployments)
  - [Branch Protection](#branch-protection)
- [Manual Deployment](#manual-deployment)
- [Production Deployment Checklist](#production-deployment-checklist)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring & Verification](#monitoring--verification)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Horizon Member Portal is a static single-page application (SPA) built with Vite and React 18. The production build outputs static HTML, CSS, and JavaScript files to the `dist/` directory. The recommended deployment platform is **Vercel**, which provides automatic builds, preview deployments, CDN distribution, and security header enforcement.

**Build output:**

```
dist/
├── index.html              # SPA entry point (no-cache)
├── vite.svg                # Favicon
└── assets/
    ├── index-[hash].js     # Application bundle (immutable cache)
    ├── vendor-[hash].js    # Vendor chunk: react, react-dom, react-router-dom
    └── index-[hash].css    # Compiled Tailwind + Honeybee CSS
```

---

## Prerequisites

Before deploying, ensure the following:

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | >= 18.x | Required for build tooling |
| **npm** | >= 9.x | Package manager |
| **Vercel CLI** (optional) | Latest | For CLI-based deployments |
| **Git** | Latest | For CI/CD integration |
| **Vercel Account** | — | Free tier is sufficient for preview/staging |

---

## Environment Variable Configuration

All client-side environment variables are prefixed with `VITE_` and are embedded into the JavaScript bundle at build time. They are **not** secret — do not store API keys, tokens, or credentials in these variables.

### Variable Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_APP_TITLE` | No | `Horizon Member Portal` | Application title displayed in the browser tab |
| `VITE_SESSION_TIMEOUT_MS` | No | `900000` | Session timeout in milliseconds (15 minutes) |
| `VITE_SESSION_WARNING_MS` | No | `120000` | Warning prompt before timeout in milliseconds (2 minutes) |
| `VITE_GLASSBOX_ENABLED` | No | `false` | Enable Glassbox session replay instrumentation (`true`/`false`) |
| `VITE_SUPPORT_EMAIL` | No | `support@horizonhealthcare.com` | Support contact email address |
| `VITE_SUPPORT_PHONE` | No | `1-800-555-0199` | Support contact phone number |
| `VITE_SUPPORT_CHAT_URL` | No | `https://support.horizonhealthcare.com/chat` | Live chat support URL |
| `VITE_DOCTOR_FINDER_URL` | No | `https://www.horizonhealthcare.com/find-a-doctor` | External doctor finder URL |

### Setting Environment Variables in Vercel

1. Navigate to your Vercel project dashboard.
2. Go to **Settings** → **Environment Variables**.
3. Add each variable with the appropriate value for the target environment(s):
   - **Production** — values used for the live site.
   - **Preview** — values used for pull request preview deployments.
   - **Development** — values used when running `vercel dev` locally.
4. Click **Save** after adding each variable.

> **Important:** Because `VITE_` variables are embedded at build time, changing an environment variable in Vercel requires a **redeployment** for the change to take effect. Vercel does not inject these at runtime.

### Local Development

Copy the example environment file and update values as needed:

```bash
cp .env.example .env
```

The `.env` file is gitignored and should never be committed to version control.

---

## Vercel Deployment

### Initial Setup

#### Option A: Vercel Dashboard (Recommended)

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import the Git repository (`horizon-healthcare/member-portal`).
4. Vercel auto-detects the Vite framework. Verify the following settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   - **Node.js Version:** 18.x
5. Add environment variables (see [Variable Reference](#variable-reference) above).
6. Click **Deploy**.

#### Option B: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Log in to your Vercel account
vercel login

# Link the project (run from the repository root)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### vercel.json Configuration Explained

The `vercel.json` file at the repository root configures Vercel's build, routing, and header behavior. Below is a section-by-section explanation:

```jsonc
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
```

- **`version`**: Vercel platform version (always `2`).
- **`buildCommand`**: Runs `vite build` via the npm script, producing the optimized production bundle.
- **`outputDirectory`**: Tells Vercel where to find the built static files.
- **`framework`**: Hints to Vercel to apply Vite-specific optimizations and defaults.

### SPA Rewrite Setup

```jsonc
  "rewrites": [
    {
      "source": "/((?!assets/).*)",
      "destination": "/index.html"
    }
  ],
```

This rewrite rule is **critical** for single-page application routing:

- **What it does:** Any request that does **not** start with `/assets/` is rewritten to serve `index.html`. This allows React Router to handle client-side routing for all application routes (`/`, `/claims`, `/benefits`, `/claims/submit`, etc.).
- **Why `/assets/` is excluded:** The `dist/assets/` directory contains hashed JavaScript, CSS, and other static files that must be served directly. Rewriting these to `index.html` would break the application.
- **How it works with React Router:** When a user navigates to `/claims` directly (e.g., via a bookmark or page refresh), Vercel serves `index.html`. React Router's `BrowserRouter` then reads the URL path and renders the correct route component.

Without this rewrite, direct navigation to any route other than `/` would return a 404 error from Vercel's static file server.

### Security Headers

```jsonc
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        }
      ]
    },
```

| Header | Value | Purpose |
|---|---|---|
| **X-Frame-Options** | `DENY` | Prevents the portal from being embedded in `<iframe>` elements on any domain. Mitigates clickjacking attacks. |
| **X-Content-Type-Options** | `nosniff` | Prevents browsers from MIME-sniffing the response content type. Ensures files are interpreted as their declared `Content-Type`. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Sends the full URL as referrer for same-origin requests, but only the origin for cross-origin requests. Balances analytics needs with privacy. |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=()` | Disables access to camera, microphone, and geolocation APIs. The portal does not require these capabilities. |
| **Strict-Transport-Security (HSTS)** | `max-age=63072000; includeSubDomains; preload` | Enforces HTTPS for 2 years, including all subdomains. The `preload` directive allows inclusion in browser HSTS preload lists. |
| **Content-Security-Policy (CSP)** | See breakdown below | Restricts the sources from which the browser can load resources. |

#### Content-Security-Policy Breakdown

| Directive | Value | Purpose |
|---|---|---|
| `default-src` | `'self'` | Default policy: only allow resources from the same origin. |
| `script-src` | `'self' 'unsafe-inline'` | Allow scripts from same origin and inline scripts (required by Vite's build output). |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | Allow styles from same origin, inline styles (Tailwind), and Google Fonts CSS. |
| `font-src` | `'self' https://fonts.gstatic.com` | Allow fonts from same origin and Google Fonts CDN (Inter font family). |
| `img-src` | `'self' data: https:` | Allow images from same origin, data URIs (html2canvas), and any HTTPS source. |
| `connect-src` | `'self' https:` | Allow network requests to same origin and any HTTPS endpoint (for future API integration). |
| `frame-ancestors` | `'none'` | Prevents the page from being embedded in frames (equivalent to `X-Frame-Options: DENY`). |
| `base-uri` | `'self'` | Restricts the `<base>` element to same origin. |
| `form-action` | `'self'` | Restricts form submissions to same origin. |

> **Note for Glassbox Integration:** If Glassbox session replay is enabled in production (`VITE_GLASSBOX_ENABLED=true`), the CSP `script-src` and `connect-src` directives may need to be updated to include the Glassbox SDK domain. Consult the Glassbox integration documentation for the specific domains required.

### Cache Control

```jsonc
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, no-cache, must-revalidate, proxy-revalidate"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
```

| Resource | Cache Policy | Rationale |
|---|---|---|
| **`index.html`** | `no-store, no-cache, must-revalidate, proxy-revalidate` | The HTML entry point must never be cached. This ensures users always receive the latest version, which references the current hashed asset filenames. |
| **`/assets/*`** | `public, max-age=31536000, immutable` | All files in `/assets/` include a content hash in their filename (e.g., `index-a1b2c3d4.js`). Because the filename changes whenever the content changes, these files can be cached indefinitely (1 year). The `immutable` directive tells browsers the file will never change at this URL. |

This caching strategy ensures:
- Users always get the latest application code on page load.
- Returning users benefit from aggressive browser caching of unchanged assets.
- CDN edge nodes cache assets efficiently.

---

## CI/CD Integration

### GitHub Integration

Vercel provides first-class GitHub integration that automates the build and deployment pipeline:

1. **Connect Repository:**
   - In the Vercel dashboard, import the GitHub repository.
   - Vercel installs a GitHub App that listens for push and pull request events.

2. **Automatic Builds:**
   - Every push to any branch triggers a Vercel build.
   - Build logs are visible in the Vercel dashboard and linked from GitHub commit statuses.

3. **GitHub Commit Statuses:**
   - Vercel posts deployment status checks on every commit.
   - Status includes a link to the deployment URL for quick verification.

### Preview Deployments

Preview deployments are created automatically for every **pull request** and every push to **non-production branches**.

- **URL Pattern:** `https://<project>-<unique-hash>-<team>.vercel.app`
- **Purpose:** Allows reviewers to test changes in an isolated environment before merging.
- **Environment Variables:** Uses the **Preview** environment variable set configured in Vercel.
- **Lifecycle:** Preview deployments are retained according to your Vercel plan's retention policy. They do not affect the production deployment.

**Workflow:**

1. Developer creates a feature branch and opens a pull request.
2. Vercel automatically builds and deploys the branch.
3. A comment is posted on the pull request with the preview URL.
4. Reviewers verify the changes at the preview URL.
5. Once approved and merged, the production deployment is triggered.

### Production Deployments

Production deployments are triggered when changes are pushed (or merged) to the **production branch** (typically `main`).

- **URL:** The custom domain or default Vercel production URL.
- **Environment Variables:** Uses the **Production** environment variable set.
- **Promotion:** Vercel atomically promotes the new build to production. The previous deployment remains available for instant rollback.

**Recommended Git Workflow:**

```
feature/branch  →  Pull Request  →  Preview Deployment  →  Review & Approve
                                                                    ↓
                                                              Merge to main
                                                                    ↓
                                                         Production Deployment
```

### Branch Protection

Configure the following GitHub branch protection rules for the `main` branch:

| Rule | Recommended Setting |
|---|---|
| **Require pull request reviews** | At least 1 approval required |
| **Require status checks to pass** | Enable; require the Vercel deployment check |
| **Require branches to be up to date** | Enable |
| **Restrict who can push** | Limit to maintainers |
| **Do not allow force pushes** | Enable |
| **Do not allow deletions** | Enable |

---

## Manual Deployment

If Vercel CI/CD is not available, the application can be deployed manually to any static hosting provider.

### Build

```bash
# Install dependencies
npm install

# Create a production build
npm run build
```

The production build is output to the `dist/` directory.

### Lint Check (Pre-Deployment)

```bash
# Run ESLint to verify code quality
npm run lint
```

Ensure zero warnings and zero errors before deploying.

### Preview Locally

```bash
# Preview the production build on a local server
npm run preview
```

This starts a local server at `http://localhost:4173` serving the `dist/` directory.

### Deploy to Any Static Host

Upload the contents of the `dist/` directory to your hosting provider. Ensure the following server configuration:

1. **SPA Fallback:** All routes must serve `index.html` (except `/assets/*`).
2. **HTTPS:** The application must be served over HTTPS.
3. **Security Headers:** Apply the same headers defined in `vercel.json` (see [Security Headers](#security-headers)).
4. **Cache Control:** Apply the same caching rules (see [Cache Control](#cache-control)).

#### Example: Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name portal.horizonhealthcare.com;

    root /var/www/horizon-member-portal/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;

    # Cache control for index.html
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate" always;
    }

    # Cache control for hashed assets
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    # SPA fallback — serve index.html for all non-asset routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Production Deployment Checklist

Complete the following checklist before every production deployment:

### Pre-Deployment

- [ ] **Code Review:** All changes have been reviewed and approved via pull request.
- [ ] **Lint Check:** `npm run lint` passes with zero warnings and zero errors.
- [ ] **Build Verification:** `npm run build` completes successfully with no errors.
- [ ] **Local Preview:** `npm run preview` has been tested and the application loads correctly.
- [ ] **Environment Variables:** All required `VITE_` environment variables are configured in Vercel for the Production environment.
- [ ] **Dependency Audit:** `npm audit` has been reviewed; no critical or high severity vulnerabilities.
- [ ] **Branch:** Changes are merged to the `main` branch (or the configured production branch).

### Functional Verification

- [ ] **Login Flow:** Login page loads, accepts credentials, and redirects to the dashboard.
- [ ] **Dashboard:** Dashboard renders with greeting, widgets, and customizer.
- [ ] **Navigation:** All sidebar navigation items route correctly.
- [ ] **Claims:** Claims list loads with filtering, sorting, and pagination. Claim detail page renders.
- [ ] **Benefits:** Benefits summary and coverage categories render with data.
- [ ] **ID Cards:** ID card preview renders with flip animation. Download PDF generates successfully.
- [ ] **Documents:** Document center loads with filtering and download functionality.
- [ ] **Notifications:** Notification bell shows unread count. Dropdown and full page render.
- [ ] **Get Care:** All sections render including care guidance table, FAQ accordion, and quick contacts.
- [ ] **Search:** Global search returns results with keyboard navigation.
- [ ] **Session Timeout:** Session warning modal appears before timeout. "Stay Logged In" extends session. Timeout triggers logout.
- [ ] **Responsive Layout:** Application renders correctly on mobile (375px), tablet (768px), and desktop (1280px+).
- [ ] **External Links:** External links trigger the leaving-site disclaimer modal.

### Accessibility Verification

- [ ] **Keyboard Navigation:** All interactive elements are reachable and operable via keyboard.
- [ ] **Skip Navigation:** "Skip to main content" link is visible on Tab and functions correctly.
- [ ] **Screen Reader:** Key pages announce correctly via live regions.
- [ ] **Focus Management:** Modal focus trap works. Focus returns to trigger element on close.
- [ ] **Color Contrast:** Text meets WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text).

### Security Verification

- [ ] **HTTPS:** Application is served exclusively over HTTPS.
- [ ] **Security Headers:** All headers from `vercel.json` are present in the response (verify via browser DevTools → Network tab → Response Headers).
- [ ] **No Sensitive Data in Bundle:** No API keys, tokens, or secrets are present in the JavaScript bundle.
- [ ] **CSP Enforcement:** Content-Security-Policy header is active and no CSP violations appear in the browser console.
- [ ] **HSTS:** Strict-Transport-Security header is present with the correct `max-age`.

### Post-Deployment

- [ ] **Production URL:** Verify the production URL loads correctly.
- [ ] **DNS/Domain:** Custom domain resolves to the Vercel deployment (if applicable).
- [ ] **SSL Certificate:** SSL certificate is valid and not expiring soon.
- [ ] **404 Handling:** Navigating to a non-existent route (e.g., `/nonexistent`) shows the 404 page.
- [ ] **Performance:** Lighthouse performance score is acceptable (target: 90+ for Performance, 95+ for Accessibility).
- [ ] **Error Monitoring:** Verify the ErrorBoundary catches and displays errors gracefully.

---

## Rollback Procedures

Vercel retains all previous deployments, enabling instant rollback without rebuilding.

### Rollback via Vercel Dashboard

1. Navigate to your project in the Vercel dashboard.
2. Go to the **Deployments** tab.
3. Find the previous stable production deployment.
4. Click the **three-dot menu** (⋯) on the deployment row.
5. Select **Promote to Production**.
6. Confirm the promotion.

The previous deployment is instantly promoted to production. No rebuild is required.

### Rollback via Vercel CLI

```bash
# List recent deployments
vercel ls

# Promote a specific deployment to production
vercel promote <deployment-url>
```

### Rollback via Git

If the issue is in the codebase, revert the commit and push to `main`:

```bash
# Revert the last commit
git revert HEAD

# Push the revert commit (triggers a new production deployment)
git push origin main
```

---

## Monitoring & Verification

### Vercel Analytics

Vercel provides built-in analytics for monitoring deployment performance:

- **Web Vitals:** Core Web Vitals (LCP, FID, CLS) are tracked automatically.
- **Function Logs:** Not applicable for this static SPA, but available if serverless functions are added in the future.
- **Deployment Logs:** Build logs for every deployment are retained in the Vercel dashboard.

### Browser DevTools Verification

After deployment, verify the following in the browser:

1. **Network Tab:**
   - `index.html` response includes `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`.
   - `/assets/*` responses include `Cache-Control: public, max-age=31536000, immutable`.
   - All security headers are present on every response.

2. **Console Tab:**
   - No CSP violation errors.
   - No JavaScript errors on page load.
   - No mixed content warnings (HTTP resources loaded over HTTPS).

3. **Application Tab:**
   - localStorage is accessible and functioning (session management, widget preferences, notification read states).

### Lighthouse Audit

Run a Lighthouse audit on the production URL to verify:

| Category | Target Score |
|---|---|
| Performance | 90+ |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 90+ |

```bash
# Run Lighthouse via Chrome DevTools
# 1. Open Chrome DevTools (F12)
# 2. Navigate to the Lighthouse tab
# 3. Select "Navigation" mode
# 4. Check all categories
# 5. Click "Analyze page load"
```

---

## Troubleshooting

### Common Issues

#### Build Fails with "JSX syntax not supported"

**Cause:** A `.js` file contains JSX syntax. Vite only transforms JSX in `.jsx` files.

**Fix:** Rename the file from `.js` to `.jsx` and update all imports referencing it.

#### 404 on Direct Route Navigation

**Cause:** The hosting provider is not configured with SPA fallback routing.

**Fix:** Ensure the `rewrites` rule in `vercel.json` is present, or configure your hosting provider to serve `index.html` for all non-asset routes.

#### Environment Variables Not Taking Effect

**Cause:** `VITE_` environment variables are embedded at build time, not runtime.

**Fix:** After changing an environment variable in Vercel, trigger a new deployment. The variable will be embedded in the next build.

#### Fonts Not Loading (CSP Violation)

**Cause:** The Content-Security-Policy `font-src` directive does not include the font CDN.

**Fix:** Verify that `font-src 'self' https://fonts.gstatic.com` is present in the CSP header. If using a different font CDN, add its domain.

#### Glassbox SDK Blocked by CSP

**Cause:** The Glassbox SDK domain is not included in the CSP `script-src` or `connect-src` directives.

**Fix:** Add the Glassbox SDK domain to the appropriate CSP directives in `vercel.json`. For example:

```
script-src 'self' 'unsafe-inline' https://cdn.glassbox.com;
connect-src 'self' https: https://api.glassbox.com;
```

#### Large Bundle Size

**Cause:** Dependencies are not being tree-shaken or chunk-split correctly.

**Fix:** The `vite.config.js` already configures vendor chunk splitting for `react`, `react-dom`, and `react-router-dom`. Verify the build output sizes:

```bash
npm run build
```

Vite reports the output file sizes after building. The vendor chunk should be separate from the application code.

#### localStorage Quota Exceeded

**Cause:** The audit log or other localStorage data has exceeded the browser's storage quota (typically 5-10 MB).

**Fix:** The audit log utility (`useAuditLogger`) maintains a rolling window of 500 entries. If the quota is still exceeded, reduce `MAX_STORED_AUDIT_ENTRIES` in `src/hooks/useAuditLogger.js` or clear old data via the browser's Application tab.

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router — Configuring Your Server](https://reactrouter.com/en/main/start/overview)
- [MDN — Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [MDN — Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)

---

© 2024 Horizon Healthcare. All rights reserved.