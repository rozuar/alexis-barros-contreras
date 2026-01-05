# CI/CD Pipeline

Automated testing and deployment to Railway using GitHub Actions.

## Workflow

```
Push to main → Tests + Coverage → Build → Deploy to Railway
```

## Trigger

- **Push to `main`**: Full pipeline (test → build → deploy)
- **Pull Request to `main`**: Tests and build only (no deploy)

## Pipeline Stages

### 1. Backend Tests (`test-backend`)
- Go 1.23 with PostgreSQL 15 service container
- Runs `go test -v -race -coverprofile=coverage.out`
- Builds binary to verify compilation

### 2. Frontend Tests (`test-frontend`)
- Node.js 18
- ESLint (`npm run lint`)
- Jest tests with coverage (`npm run test:ci`)
- Build verification (`npm run build`)

### 3. Backoffice Tests (`test-backoffice`)
- Node.js 18
- ESLint (`npm run lint`)
- Jest tests with coverage (`npm run test:ci`)
- Build verification (`npm run build`)

### 4. Deploy (`deploy`)
- **Only runs on push to `main`** (not PRs)
- Requires all tests to pass
- Deploys all 3 services to Railway in parallel

## Required Secret

Configure in GitHub Repository → Settings → Secrets:

```
RAILWAY_TOKEN=your_railway_project_token
RAILWAY_PROJECT_ID=your_railway_project_id (optional but recommended)
```

To get a Railway token:
1. Go to Railway Dashboard → **Project** → Settings → Tokens
2. Create a **Project Token**
3. Add it as GitHub secret `RAILWAY_TOKEN`

To get the Project ID (optional):
1. Railway Dashboard → Project → Settings → General (Project ID)
2. Add it as GitHub secret `RAILWAY_PROJECT_ID`

## Environment Variables (Railway)

### Backend
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection (auto-provided by Railway) |
| `ADMIN_TOKEN` | Authentication token for admin API |
| `BUCKET_NAME` | S3 bucket name (Railway Object Storage) |
| `BUCKET_ENDPOINT` | S3 endpoint URL |
| `BUCKET_ACCESS_KEY_ID` | S3 access key |
| `BUCKET_SECRET_ACCESS_KEY` | S3 secret key |

### Frontend / Backoffice
| Variable | Description |
|----------|-------------|
| `BACKEND_URL` | Internal backend URL (e.g., `http://backend.railway.internal:8090`) |

## Local Development

```bash
# Backend
cd backend
go test -v ./...
go build .

# Frontend
cd frontend
npm install
npm run lint
npm run test:ci
npm run build

# Backoffice
cd backoffice
npm install
npm run lint
npm run test:ci
npm run build
```

## Troubleshooting

### Tests failing locally but passing in CI
- Ensure you have the same Node.js (18) and Go (1.23) versions
- Check if PostgreSQL is running for backend tests

### Deployment not triggering
- Verify you're pushing to `main` branch
- Check that `RAILWAY_TOKEN` secret is set
- Review GitHub Actions logs for errors

### Railway deployment errors
- Verify Railway token has correct permissions
- Check Railway dashboard for service logs
- Ensure environment variables are set in Railway
