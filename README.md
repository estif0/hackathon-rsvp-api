# 🚀 Tech Club & Hackathon RSVP API

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%207.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express 5](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Cloud-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Better Auth](https://img.shields.io/badge/Auth-Better%20Auth-FF4154?style=flat-square)](https://better-auth.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

A modular, production-ready RESTful API for university tech clubs to manage club organizations, schedule hackathon events, and handle student RSVPs with role-based access control and strict capacity limits.

---

## 🌟 Features

- **🔐 Robust Authentication & RBAC:** Session-based authentication and role-based permissions (`admin` vs `student`) powered by [Better Auth](https://better-auth.com/).
- **🏛️ Club & Hackathon Management:** Full CRUD operations for tech clubs and upcoming hackathons with date scheduling and attendee quotas.
- **🎟️ Smart RSVP Engine:**
  - Enforces maximum attendee capacity limits.
  - Idempotent RSVP submission (prevents duplicate registrations).
  - Allows attendees to track and cancel their RSVPs.
  - Restricted organizer view for viewing registered attendees.
- **📖 Interactive API Documentation:** Live Swagger / OpenAPI 3.0 UI documentation available out of the box at `/api/docs`.
- **🧪 Comprehensive Test Suite:** 38 automated end-to-end and integration tests covering all routes and edge cases using [Vitest](https://vitest.dev/).
- **☁️ Cloud & Container Ready:** Configured for one-click deployment on [Render](https://render.com/) with [Neon](https://neon.tech/) Serverless PostgreSQL and local Docker Compose support.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Language & Runtime** | [TypeScript](https://www.typescriptlang.org/) / [Node.js](https://nodejs.org/) (ES Modules) with [tsx](https://github.com/privatenumber/tsx) |
| **Framework** | [Express 5](https://expressjs.com/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) ([Neon](https://neon.tech/)) & [Prisma ORM 7](https://www.prisma.io/) via `@prisma/adapter-pg` |
| **Authentication** | [Better Auth](https://better-auth.com/) (Email & Password, Session Cookies) |
| **API Docs** | [Swagger UI](https://swagger.io/) & [OpenAPI 3.0](https://www.openapis.org/) (`swagger-ui-express`) |
| **Testing** | [Vitest](https://vitest.dev/) & [Supertest](https://github.com/ladjs/supertest) |
| **Deployment** | [Render](https://render.com/) Web Service (`render.yaml`) & [Docker](https://www.docker.com/) / Docker Compose |

---

## 📂 Project Structure

```text
hackathon-rsvp-api/
├── prisma/
│   ├── schema.prisma          # Database schema (Users, Clubs, Hackathons, RSVPs)
│   └── seed.ts                # Database seeder with sample clubs, events & users
├── prisma.config.ts           # Prisma 7 connection configuration
├── src/
│   ├── config/
│   │   ├── db.ts              # PostgreSQL connection pool & Prisma Client adapter
│   │   └── swagger.ts         # OpenAPI 3.0 specification & Swagger UI configuration
│   ├── lib/
│   │   └── errors.ts          # Custom domain and HTTP error classes
│   ├── middlewares/
│   │   ├── auth.middleware.ts # Session verification and role guard (adminCheck)
│   │   └── error.middleware.ts# Centralized error handling middleware
│   ├── modules/
│   │   ├── auth/              # Better Auth configuration and handlers
│   │   ├── clubs/             # Club controller, routes, and validation
│   │   ├── hackathons/        # Hackathon controller, routes, and scheduling logic
│   │   └── rsvps/             # RSVP controller, routes, and capacity enforcement
│   ├── types/
│   │   └── express.d.ts       # Express request typing extensions (user & session)
│   ├── app.ts                 # Express application middleware pipeline
│   └── server.ts              # HTTP listener and entry point
├── tests/
│   ├── clubs.test.ts          # Club endpoints integration tests
│   ├── hackathons.test.ts     # Hackathon endpoints integration tests
│   ├── health.test.ts         # Health check and root route tests
│   └── rsvps.test.ts          # RSVP flow, duplicate, and capacity tests
├── Dockerfile                 # Multi-stage production container build
├── docker-compose.yml         # Local development database and container setup
├── render.yaml                # Render Blueprint for automated deployment
└── package.json               # Scripts and dependency specifications
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (reference [.env.example](file:///c:/Users/Estifo1/Documents/codebase/01_active/hackathon-rsvp-api/.env.example)):

```env
# Database (Neon Cloud PostgreSQL or local PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
DATABASE_URL_POOLED="postgresql://user:password@host-pooler:port/dbname?sslmode=require"

# Server & Auth Configuration
PORT=3000
BETTER_AUTH_SECRET="your-secure-random-secret-at-least-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher
- **pnpm**: `corepack enable && corepack prepare pnpm@latest --activate` (or `npm i -g pnpm`)

### 2. Installation
```bash
git clone https://github.com/estif0/hackathon-rsvp-api.git
cd hackathon-rsvp-api
pnpm install
```

### 3. Database Setup & Seeding
Push the Prisma schema to your database and generate the Prisma Client:
```bash
# Push schema to database
pnpm db:push

# Seed initial clubs, hackathons, and demo users
pnpm db:seed
```

#### Demo Accounts Seeded:
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@club.com` | `AdminPassword123!` |
| **Student** | `alice@university.edu` | `StudentPassword123!` |
| **Student** | `bob@university.edu` | `StudentPassword123!` |

### 4. Running the Server

#### Development Mode (with hot-reloading):
```bash
pnpm dev
```

#### Production Mode:
```bash
pnpm start
```

The API will be available at:
- **Server:** `http://localhost:3000`
- **Interactive Documentation:** `http://localhost:3000/api/docs`
- **Health Check:** `http://localhost:3000/api/health`

---

## 🐳 Docker Setup

To run both the application and a local PostgreSQL database with Docker Compose:

```bash
docker compose up --build
```

---

## 🧪 Running Automated Tests

The test suite runs end-to-end integration tests using Vitest against the database:

```bash
# Run all tests once
pnpm test

# Run tests in interactive watch mode
pnpm test:watch
```

---

## 📚 API Reference Overview

All routes are prefixed with `/api` (or accessed directly). Detailed schemas, request bodies, and responses can be viewed interactively at `/api/docs`.

### 🩺 System & Docs
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | API status and documentation links | None |
| `GET` | `/api/health` | Service health status and timestamp | None |
| `GET` | `/api/docs` | Swagger UI documentation | None |

### 🔐 Authentication (`/api/auth/*`)
Handled by Better Auth:
- `POST /api/auth/sign-up/email` — Register new user (`name`, `email`, `password`)
- `POST /api/auth/sign-in/email` — Login with credentials (sets session cookie)
- `POST /api/auth/sign-out` — Terminate session
- `GET /api/auth/get-session` — Get current logged-in user and session

### 🏛️ Clubs (`/api/clubs`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/clubs` | List all registered clubs | Public |
| `GET` | `/api/clubs/:id` | Retrieve club details by ID | Public |
| `POST` | `/api/clubs` | Create a new club | **Admin** |
| `PATCH`| `/api/clubs/:id` | Update club information | **Admin** |
| `DELETE`| `/api/clubs/:id` | Delete a club | **Admin** |

### 💻 Hackathons (`/api/hackathons`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/hackathons` | List all hackathons (supports `?clubId=`) | Public |
| `GET` | `/api/hackathons/:id` | Retrieve hackathon details & RSVP count | Public |
| `POST` | `/api/hackathons` | Create a new hackathon event | **Admin** |
| `PATCH`| `/api/hackathons/:id` | Update hackathon dates, title, or capacity | **Admin** |
| `DELETE`| `/api/hackathons/:id` | Remove a hackathon | **Admin** |
| `GET` | `/api/hackathons/:id/rsvps` | List attendee details for an event | **Admin** |

### 🎟️ RSVPs (`/api/rsvps`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/rsvps` | RSVP to a hackathon (validates capacity) | **Authenticated** |
| `GET` | `/api/rsvps/me` | List current user's active RSVPs | **Authenticated** |
| `DELETE`| `/api/rsvps/:hackathonId` | Cancel an existing RSVP | **Authenticated** |

---

## ☁️ Deployment

### Deploying to Render

This repository includes a [`render.yaml`](file:///c:/Users/Estifo1/Documents/codebase/01_active/hackathon-rsvp-api/render.yaml) blueprint:

1. Create a free account on [Render](https://render.com/).
2. Create a new **Web Service** and link this repository (`estif0/hackathon-rsvp-api`).
3. Set the following settings:
   - **Environment:** `Node`
   - **Build Command:** `pnpm install && pnpm run build`
   - **Start Command:** `pnpm start`
4. Provide your environment variables (or import from `.env.prod`):
   - `DATABASE_URL` (from Neon)
   - `DATABASE_URL_POOLED` (from Neon)
   - `BETTER_AUTH_SECRET` (random string)
   - `BETTER_AUTH_URL` (`https://<your-service>.onrender.com`)
   - `CORS_ORIGIN` (`*`)
   - `NODE_ENV` (`production`)
5. Click **Deploy**!

---

## 📜 Scripts Reference

- `pnpm dev` — Start the server in watch mode with `tsx`
- `pnpm build` — Generate Prisma Client for deployment
- `pnpm start` — Run production server
- `pnpm test` — Run all automated test suites with Vitest
- `pnpm typecheck` — Run TypeScript type checking without emitting files
- `pnpm db:generate` — Generate Prisma client
- `pnpm db:push` — Push schema directly to PostgreSQL
- `pnpm db:migrate` — Apply database migrations
- `pnpm db:seed` — Populate database with sample data
- `pnpm db:studio` — Open Prisma Studio web GUI

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
