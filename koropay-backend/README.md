# KoroPay Backend

Monolith REST API for the KoroPay transport payment platform.

## Stack
- Node.js + TypeScript
- Express
- PostgreSQL + Prisma ORM
- JWT Auth + bcrypt

## Project Structure

```
src/
├── app.ts                  # Entry point
├── config/
│   └── prisma.ts           # Prisma client singleton
├── middleware/
│   └── auth.ts             # JWT authenticate + role authorize
├── modules/
│   ├── auth/               # Register, Login, Me
│   ├── admin/              # Drivers, Agents, Transactions, Levy Settings
│   ├── driver/             # Routes, Trips, Payments, Levies
│   └── agent/              # Checkpoint dashboard, OTP collection, History
├── types/
│   └── index.ts            # Shared types
└── utils/
    └── jwt.ts              # Token helpers + OTP generator
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Demo data seed
```

## Setup

1. Install dependencies
```bash
npm install
```

2. Configure environment
```bash
cp .env.example .env
# Update DATABASE_URL with your PostgreSQL connection string
```

3. Run database migrations
```bash
npm run db:migrate
```

4. Seed demo data
```bash
npm run db:seed
```

5. Start dev server
```bash
npm run dev
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Admin (requires admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | System stats |
| GET | /api/admin/drivers | List drivers |
| POST | /api/admin/drivers | Onboard driver |
| GET | /api/admin/drivers/:id | Driver detail |
| PATCH | /api/admin/drivers/:id/status | Update driver status |
| GET | /api/admin/agents | List agents |
| POST | /api/admin/agents | Onboard agent |
| GET | /api/admin/agents/:id | Agent detail |
| PATCH | /api/admin/agents/:id/status | Update agent status |
| GET | /api/admin/transactions | All transactions |
| GET | /api/admin/levy-settings | List levy settings |
| POST | /api/admin/levy-settings | Create levy |
| PATCH | /api/admin/levy-settings/:id | Update levy |
| DELETE | /api/admin/levy-settings/:id | Delete levy |

### Driver (requires driver JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/driver/dashboard | Today's stats |
| GET | /api/driver/routes | List routes |
| POST | /api/driver/routes | Create route |
| DELETE | /api/driver/routes/:id | Delete route |
| GET | /api/driver/trips | Trip history |
| POST | /api/driver/trips | Start trip |
| POST | /api/driver/trips/:id/payments | Add passenger payment |
| PATCH | /api/driver/trips/:id/end | End trip |
| GET | /api/driver/levies | List levies |
| POST | /api/driver/levies/:id/request-otp | Request OTP |
| POST | /api/driver/levies/:id/verify-otp | Verify OTP |

### Agent (requires agent JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/agent/dashboard | Checkpoint stats |
| POST | /api/agent/payments/request | Request payment from driver |
| POST | /api/agent/payments/:id/verify | Verify OTP & mark paid |
| GET | /api/agent/history | Levy collection history |

## Demo Credentials (after seeding)

| Role | Phone | Password |
|------|-------|----------|
| Admin | 08000000000 | admin123 |
| Driver | 08012345678 | driver123 |
| Agent | 08099887766 | agent123 |
