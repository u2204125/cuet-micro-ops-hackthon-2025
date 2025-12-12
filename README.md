# 🏆 Delineate Hackathon Challenge - CUET Fest 2025

[![CI/CD Status](https://github.com/u2204125/cuet-micro-ops-hackthon-2025/actions/workflows/ci.yml/badge.svg)](https://github.com/u2204125/cuet-micro-ops-hackthon-2025/actions)

> **A production-ready async file download microservice with full observability stack**

## 📊 Challenge Status: ALL COMPLETED ✅

| Challenge | Points | Status | Implementation |
|-----------|--------|--------|---------------|
| Challenge 1: S3 Storage | 15 | ✅ **DONE** | MinIO with auto-bucket creation |
| Challenge 2: Architecture Design | 15 | ✅ **DONE** | Redis + BullMQ async job queue |
| Challenge 3: CI/CD Pipeline | 10 | ✅ **DONE** | GitHub Actions with E2E tests |
| Challenge 4: Observability | 10 | ✅ **DONE** | Sentry, OpenTelemetry, Grafana, Prometheus |
| **Total** | **50** | **50/50** | **Production-Ready** |

---

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Development mode (full observability stack)
npm run docker:dev

# Access:
# - Backend API: http://localhost:3000
# - Frontend Dashboard: http://localhost:5173
# - Grafana: http://localhost:3001
# - Prometheus: http://localhost:9095
# - Kibana: http://localhost:5601
```

### Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start backend
npm run dev

# Start frontend (in another terminal)
cd frontend && npm install && npm run dev
```

---

## 📋 Our Solution: Async Job Polling System

We've implemented a **production-ready asynchronous job queue** using Redis and BullMQ:

```
Client → POST /initiate → Returns jobId (< 100ms)
         ↓
    Redis Queue
         ↓
    Background Worker (processes files)
         ↓
Client ← GET /jobs/:jobId (poll every 2s) ← Progress updates
```

### Key Features

- ⚡ **Instant Response**: Job initiation returns in <100ms
- 📊 **Real-time Progress**: Track job status from 0% to 100%
- 🔄 **Automatic Retries**: Exponential backoff on failures
- 🎯 **Concurrent Processing**: Up to 5 jobs simultaneously
- 💾 **Persistence**: Jobs survive server restarts (Redis AOF)
- 📱 **Frontend Polling**: React hook with automatic updates

### API Demo

```bash
# 1. Initiate a job
curl -X POST http://localhost:3000/v1/download/initiate \
  -H "Content-Type: application/json" \
  -d '{"file_ids": [70000, 70007, 70014]}'
# Returns: {"jobId":"uuid","status":"queued","totalFileIds":3}

# 2. Poll for status (repeat every 2-3 seconds)
curl http://localhost:3000/v1/download/jobs/{jobId}
# Returns: {"status":"processing","progress":67,"totalFiles":3,...}

# 3. When complete
# Returns: {"status":"completed","progress":100,"result":{...}}
```

---

## 🎨 Frontend Dashboard

Our React-based observability dashboard provides real-time monitoring and testing capabilities.

### Components

| Component | Description |
|-----------|-------------|
| **HealthCheck** | Real-time API health status from `/health` endpoint |
| **DownloadTester** | Async job queue demo with progress tracking |
| **ErrorLogger** | Error tracking with Sentry integration |
| **ObservabilityLinks** | Links to Grafana, Prometheus, Kibana, MinIO |
| **TraceViewer** | Distributed tracing visualization |

### Features

- ✅ **Real-time Health Monitoring** - Live API status
- ✅ **Job Progress Bars** - Visual progress tracking
- ✅ **Error Tracking** - Frontend & backend errors
- ✅ **Metrics Display** - API requests & error counts
- ✅ **Trace Correlation** - End-to-end traceability

### Frontend Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Observability**: OpenTelemetry Web SDK + Sentry React SDK

---

## 🔧 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/health` | Health check with storage status |
| GET | `/metrics` | Prometheus metrics endpoint |
| GET | `/docs` | OpenAPI documentation (dev) |

### Job Queue Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/download/initiate` | ⚡ Initiate async job |
| GET | `/v1/download/jobs/:jobId` | 📊 Poll job status |

### Error Testing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/error/test` | Trigger test error for Sentry |

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 24 with native TypeScript
- **Framework**: [Hono](https://hono.dev) - Ultra-fast web framework
- **Validation**: [Zod](https://zod.dev) with OpenAPI
- **Storage**: AWS S3 SDK with MinIO
- **Job Queue**: Redis + [BullMQ](https://docs.bullmq.io/)

### Observability
- **Tracing**: OpenTelemetry (frontend + backend)
- **Metrics**: Prometheus + Grafana
- **Logs**: Elasticsearch + Kibana
- **Error Tracking**: Sentry

---

## 📁 Project Structure

```
.
├── src/
│   ├── index.ts          # Main API entry point
│   └── queue.ts          # BullMQ job queue
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main dashboard
│   │   ├── components/
│   │   │   ├── HealthCheck.tsx
│   │   │   ├── DownloadTester.tsx
│   │   │   ├── ErrorLogger.tsx
│   │   │   ├── ObservabilityLinks.tsx
│   │   │   └── TraceViewer.tsx
│   │   ├── hooks/
│   │   │   └── useJobPolling.ts  # Job polling hook
│   │   └── instrumentation.ts    # OpenTelemetry setup
├── docker/
│   ├── compose.dev.yml   # Development stack
│   └── compose.prod.yml  # Production stack
└── .github/
    └── workflows/
        └── ci.yml        # CI/CD pipeline
```

---

## 🔄 CI/CD Pipeline

Our GitHub Actions pipeline includes:

1. **Lint** - ESLint + Prettier checks
2. **E2E Tests** - Full test suite with MinIO + Redis
3. **Build** - Docker image build

### Running Locally

```bash
# Check formatting
npm run format:check

# Run linter
npm run lint

# Run E2E tests
npm run test:e2e
```

---

## ⚙️ Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# S3 Configuration
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=downloads

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Observability
SENTRY_DSN=
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

---

## 📜 Available Scripts

```bash
npm run dev          # Start dev server
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run format:check # Check formatting
npm run test:e2e     # Run E2E tests
npm run docker:dev   # Start Docker stack
npm run docker:prod  # Production Docker
```

---

## 🔒 Security Features

- Request ID tracking for distributed tracing
- Rate limiting with configurable windows
- Security headers (HSTS, X-Frame-Options, etc.)
- CORS configuration
- Input validation with Zod schemas
- Path traversal prevention for S3 keys
- Graceful shutdown handling

---

## 📄 License

MIT

---

## 👥 Team

**CUET Fest 2025 Hackathon Submission**

Built with ❤️ for the Delineate Hackathon Challenge
