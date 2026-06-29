# Feature Flag Management System

A multi-tenant SaaS-like feature flag management system with three separate frontends and a Node.js backend.

## Live Links

| App | URL |
|-----|-----|
| Super Admin | https://feature-flag-super-admin.vercel.app/ |
| Admin | https://feature-flag-admin.vercel.app/ |
| User | https://feature-flag-user.vercel.app/ |
| Backend API | https://feature-flag-system-xcqm.onrender.com/ |

> **Note:** Backend is deployed on Render free tier. It may take 30-50 seconds to respond on the first request due to cold start. Please wait and retry if the first request fails.

## Test Credentials

**Super Admin**
- Email: admin@system.com
- Password: admin123

**Sample Org Admin** (create via Admin app signup)
- Select any organization from the dropdown
- Use any email and password

## Tech Stack

- **Backend:** Node.js, Express, PostgreSQL (pg)
- **Auth:** Custom JWT implementation (bcryptjs for password hashing)
- **Frontend:** React (Vite) - 3 separate apps

## Architecture

Three separate frontend applications each serving a different user role:

- **Super Admin App** - manages organizations
- **Admin App** - manages feature flags per organization
- **User App** - checks if a feature flag is enabled

## Database Schema

**organizations** - id, name, created_at

**users** - id, username, email, password, role, org_id, created_at

**feature_flags** - id, org_id, feature_key, is_enabled, created_at

## Key Design Decisions

- **PostgreSQL on Render** - persistent cloud database ensuring data consistency across devices and deployments.
- **Role stored as column in users table** - roles are fixed (super_admin, org_admin, end_user) so a separate roles table would be unnecessary overhead.
- **JWT with org_id in payload** - org scoping is enforced at the middleware level. Org admins can only access flags belonging to their org.
- **No auth for end users** - end users only check flags by providing feature_key and org_id. No sensitive data is exposed.
- **Separate frontends** - different security boundaries and independent deployment cycles for each user type.

## Self Grade

| Category | Grade | Notes |
|----------|-------|-------|
| Performance | B | PostgreSQL handles concurrent requests well. No caching implemented. |
| Readability & Maintainability | A | Routes are separated by concern, middleware is reusable |
| Stability | B | Basic error handling and validation in place. Edge cases like expired tokens handled. |
| Testability | B | 13 unit tests written covering auth, organizations, and feature flags using Jest and Supertest. |

## Running Locally

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend Apps
```bash
cd super-admin-app
npm install
npm run dev

cd admin-app
npm install
npm run dev

cd user-app
npm install
npm run dev
```
