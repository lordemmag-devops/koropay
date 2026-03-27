# KoroPay

> Digitizing informal transport payments — one trip at a time.

KoroPay is a transport payment and management platform built for informal transport systems. It enables passengers to pay fixed fares digitally per trip, and allows transport unions to collect checkpoint levies using an OTP-based verification system — replacing cash, disputes, and manual record-keeping with a transparent, real-time digital flow.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running with Docker (Recommended)](#running-with-docker-recommended)
  - [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Demo Credentials](#demo-credentials)
- [User Flows](#user-flows)
- [Database Schema](#database-schema)
- [Future Improvements](#future-improvements)

---

## Problem Statement

Informal transport systems face persistent challenges:

- Cash-based payments leading to disputes and lack of change
- No structured way to track passengers and payments per trip
- Unstructured union levy collection with no transparency
- Revenue leakage and lack of accountability for drivers and unions

---

## Solution

KoroPay provides:

1. **Passenger-to-driver digital payments** — passenger dials USSD,  Interswitch debits their bank account and credits the driver's account instantly
2. **Automatic passenger name resolution** — pulled from the passenger's bank account via Interswitch account enquiry, no manual entry needed
3. **Optional drop point selection** for driver awareness and record-keeping
4. **Driver dashboard** for real-time trip tracking and earnings management
5. **OTP-based union levy payments** — union-controlled pricing, agent-verified collection
6. **Admin panel** for managing drivers, agents, transactions, and levy settings
7. **USSD simulator** for demonstrating the full passenger payment flow (backed by real Interswitch API calls)

---

## Features

### Driver
- Login and role-based access
- Create and manage routes with fixed fares and drop points
- Start a trip, receive real-time passenger payments, end trip with full summary
- View earnings history broken down per trip
- View and pay pending union levies  via OTP

### Agent (Checkpoint)
- Dashboard showing all active drivers and today's collection
- Search driver by plate number or name
- Request OTP payment from driver — OTP sent to driver's phone
- Verify OTP to confirm payment and mark driver as paid
- Full levy collection history grouped by date

### Admin
- System-wide dashboard with total drivers, agents, revenue, and levies collected
- Onboard and manage drivers and agents — including bank account number and bank selection for payment settlement
- Update driver/agent status (active, suspended, offline)
- View all transactions with filtering by type and status
- Centrally manage levy settings (create, update amount, toggle active, delete)

---

## System Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Frontend (React)  │────▶│   Backend (Express)  │────▶│  PostgreSQL (Prisma) │
│   Vite + TypeScript │     │   Node.js + JWT      │     │                     │
│   Nginx (Docker)    │     │   REST API           │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
                                       │
                                       ▼
                             ┌─────────────────────┐
                             │  Interswitch API     │
                             │  (Payment + OTP)     │
                             └─────────────────────┘
```

**Stack:**
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express 5, TypeScript, Prisma ORM
- Database: PostgreSQL 16
- Auth: JWT + bcrypt
- Payments: Interswitch (Safetoken OTP + account name enquiry + inter-bank funds transfer)
- Containerisation: Docker + Docker Compose

---

## Project Structure

```
koropay/
├── koropay-backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # Demo data seed
│   │   └── migrations/          # Prisma migration history
│   ├── src/
│   │   ├── app.ts               # Entry point
│   │   ├── config/              # Prisma client, Interswitch client, Swagger
│   │   ├── middleware/          # JWT auth + role authorization
│   │   ├── modules/
│   │   │   ├── auth/            # Register, Login, Me
│   │   │   ├── admin/           # Drivers, Agents, Transactions, Levy Settings
│   │   │   ├── driver/          # Routes, Trips, Payments, Levies
│   │   │   ├── agent/           # Dashboard, OTP collection, History
│   │   │   └── payment/         # Interswitch: bank list, USSD payment initiation, confirmation
│   │   ├── types/               # Shared TypeScript types
│   │   └── utils/               # JWT helpers
│   ├── Dockerfile
│   └── package.json
│
├── koropay-frontend/
│   ├── src/
│   │   ├── components/          # Layout, Sidebar
│   │   ├── context/             # AuthContext (JWT + user session)
│   │   ├── data/                # Demo/mock data (for USSD simulator)
│   │   ├── pages/
│   │   │   ├── admin/           # AdminDashboard, DriverManagement, AgentManagement,
│   │   │   │                    # DriverDetail, AgentDetail, Transactions, LevySettings
│   │   │   ├── agent/           # AgentDashboard, LevyHistory
│   │   │   ├── Dashboard.tsx    # Driver dashboard
│   │   │   ├── Routes.tsx       # Route management
│   │   │   ├── Trip.tsx         # Live trip tracking
│   │   │   ├── Earnings.tsx     # Earnings history
│   │   │   ├── Levies.tsx       # Levy payments
│   │   │   ├── Login.tsx        # Auth
│   │   │   └── USSDSimulator.tsx
│   │   ├── types/               # Shared TypeScript types
│   │   └── utils/
│   │       └── api.ts           # Typed API helpers (authApi, driverApi, agentApi, adminApi, paymentApi)
│   ├── Dockerfile
│   └── package.json
│
├── .env                         # Root environment variables
├── .env.example                 # Environment variable template
├── docker-compose.yml           # Full stack orchestration
└── README.md
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
- Or: Node.js 20+, PostgreSQL 16

### Running with Docker (Recommended)

This is the easiest way to run the full stack — no manual database setup required.

```bash
# 1. Clone the repository
git clone https://github.com/lordemmag-devops/koropay.git
cd koropay

# 2. Start all services (postgres + backend + frontend)
docker compose up --build
```

That's it. Docker will:
- Start a PostgreSQL database
- Run database migrations automatically
- Seed demo data (drivers, agents, admin, levy settings)
- Start the backend API on port 5000
- Serve the frontend on port 3000

Open **http://localhost:3000** in your browser.

To stop:
```bash
docker compose down
```

---

### Running Locally

**1. Clone and install dependencies**

```bash
git clone https://github.com/lordemmag-devops/koropay.git
cd koropay
```

**2. Configure environment**

```bash
cp .env.example .env
# Update DATABASE_URL with your local PostgreSQL credentials
```

**3. Set up the database**

```bash
# Run from the root directory so .env is picked up automatically
npx prisma migrate dev --name init --schema=koropay-backend/prisma/schema.prisma
```

**4. Seed demo data**

```bash
cd koropay-backend && npm run db:seed
```

**5. Start the backend**

```bash
cd koropay-backend && npm run dev
# Runs on http://localhost:5000
```

**6. Start the frontend**

```bash
cd koropay-frontend && npm run dev
# Runs on http://localhost:5173
```

---

## Environment Variables

All environment variables live in the root `.env` file. Copy `.env.example` to get started.

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (local) | `postgresql://admin@localhost:5432/koropay?schema=public` |
| `JWT_SECRET` | Secret key for signing JWTs | `your_secret_here` |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `INTERSWITCH_CLIENT_ID` | Interswitch API client ID | `IKIA...` |
| `INTERSWITCH_CLIENT_SECRET` | Interswitch API client secret | `5BA7...` |
| `INTERSWITCH_BASE_URL` | Interswitch base URL | `https://sandbox.interswitchng.com` |

> Docker Compose injects its own `DATABASE_URL` pointing to the internal `postgres` service — no changes needed for Docker.

---

## API Reference

All endpoints are prefixed with `/api`. Full Swagger docs available at **http://localhost:5000/api/docs** when the backend is running.

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Register a new user |
| POST | `/auth/login` | None | Login, returns JWT |
| GET | `/auth/me` | JWT | Get current user profile |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | System-wide stats |
| GET | `/admin/drivers` | List all drivers (supports `?search=`) |
| POST | `/admin/drivers` | Onboard a driver |
| GET | `/admin/drivers/:id` | Driver detail with routes and trips |
| PATCH | `/admin/drivers/:id/status` | Update driver status |
| GET | `/admin/agents` | List all agents |
| POST | `/admin/agents` | Onboard an agent |
| GET | `/admin/agents/:id` | Agent detail with collection history |
| PATCH | `/admin/agents/:id/status` | Update agent status |
| GET | `/admin/transactions` | All transactions (supports `?search=`, `?type=`, `?status=`) |
| GET | `/admin/levy-settings` | List levy settings |
| POST | `/admin/levy-settings` | Create levy setting |
| PATCH | `/admin/levy-settings/:id` | Update levy amount or active status |
| DELETE | `/admin/levy-settings/:id` | Delete levy setting |

### Driver
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/driver/dashboard` | Today's trips, earnings, pending levies |
| GET | `/driver/routes` | List driver's routes |
| POST | `/driver/routes` | Create a route with drop points |
| DELETE | `/driver/routes/:id` | Delete a route |
| GET | `/driver/trips` | Full trip history |
| POST | `/driver/trips` | Start a new trip |
| POST | `/driver/trips/:id/payments` | Record a passenger payment |
| PATCH | `/driver/trips/:id/end` | End a trip |
| GET | `/driver/levies` | List levy payments |
| POST | `/driver/levies/:id/request-otp` | Request OTP for levy payment |
| POST | `/driver/levies/:id/verify-otp` | Verify OTP and mark levy as paid |

### Agent
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/agent/dashboard` | Today's collections and driver list |
| POST | `/agent/payments/request` | Request payment from driver (sends OTP) |
| POST | `/agent/payments/:id/verify` | Verify OTP and mark payment as paid |
| GET | `/agent/history` | Full levy collection history |

### Payment
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/payment/banks` | None | List all supported Nigerian banks with codes |
| POST | `/payment/ussd/initiate` | None | Debit passenger, credit driver, resolve passenger name via Interswitch |
| GET | `/payment/verify/:transactionRef` | None | Verify an Interswitch transaction by reference |
| POST | `/payment/confirm/trip` | JWT | Manually confirm and record a trip payment |
| POST | `/payment/confirm/levy` | JWT | Manually confirm and record a levy payment |

---

## Demo Credentials

After seeding (automatic with Docker), use these to log in:

| Role | Phone | Password |
|------|-------|----------|
| Admin | `08000000000` | `admin123` |
| Driver | `08012345678` | `driver123` |
| Driver | `08098765432` | `driver123` |
| Agent | `08099887766` | `agent123` |

---

## User Flows

### Driver Flow
1. Login → Driver Dashboard
2. Set Route — define route name, fixed fare, and drop points
3. Start Trip — select a route to begin
4. Passenger dials USSD, selects route and drop point, confirms payment — Interswitch debits passenger and credits driver; passenger name resolved automatically from their bank account
5. Payment appears live on the driver's trip screen
6. End Trip — view full summary (passengers, earnings, duration)
7. Earnings — view all trip history with per-passenger breakdown
8. Levies — view pending levies, request OTP, verify to pay

### Passenger Flow (USSD)
1. Dial USSD code and select bank
2. Select route
3. Select drop point (optional)
4. Confirm fare — Interswitch debits bank account and credits driver instantly
5. Receive confirmation with transaction reference

### Agent Flow
1. Login → Checkpoint Dashboard
2. View all active drivers and today's collection total
3. Search driver by plate number or name
4. Click "Request Payment" — OTP sent to driver's phone
5. Driver provides OTP → Agent enters it → Payment confirmed
6. Driver moves to "Paid" list
7. Levy History — full collection records grouped by date

### Admin Flow
1. Login → Admin Dashboard — system-wide stats
2. Drivers — onboard new drivers, update status, view detail
3. Agents — onboard new agents, update status, view collection history
4. Transactions — view and filter all payments across the system
5. Levy Settings — define and manage union levy prices centrally

---

## Database Schema

| Table | Key Fields |
|-------|-----------|
| `User` | id, name, phone, password, role |
| `Driver` | id, userId, vehiclePlate, route, accountNumber, bankCode, status, totalEarnings, totalTrips |
| `Agent` | id, userId, checkpoint, location, fee, status, totalCollected, totalScans |
| `Route` | id, driverId, routeName, fare |
| `DropPoint` | id, routeId, name |
| `Trip` | id, driverId, routeId, fare, totalPassengers, totalAmount, status, startTime, endTime |
| `TripPayment` | id, tripId, passengerName, passengerPhone, amount, dropPoint, status |
| `Transaction` | id, tripId, passengerName, amount, type, status, timestamp |
| `UnionPayment` | id, driverId, agentId, levyName, amount, status, otp, timestamp |
| `LevySetting` | id, levyName, amount, location, active |

---

## Future Improvements

- Full USSD integration with a real telecom provider (currently simulated in-browser)
- SMS delivery for OTP via Interswitch Safetoken
- Passenger receipt generation
- Allow drivers to update their bank account details from their profile
- AI-powered route optimization
- Offline mode for low-connectivity environments
- Analytics dashboard with charts and export
- Driver rating system
- Multi-union support

---

## Value Proposition

KoroPay transforms informal transport by digitizing payments, improving efficiency, and increasing transparency for both drivers and transport unions — making every trip accountable and every levy verifiable.
