# Tech Club & Hackathon RSVP API

A modular REST API for tech clubs to organize hackathons and manage member RSVPs with capacity limits and role-based permissions.

## Tech Stack

- **Runtime & Framework:** Node.js (ESM), Express 5, TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM 7 (with `@prisma/adapter-pg`)
- **Authentication:** Better Auth (session cookies, email & password, role-based access)
- **Documentation:** OpenAPI 3.0 via Swagger UI (`/api/docs`)
- **Deployment:** Docker / Docker Compose & Vercel

---

## Architecture & Directory Structure

Organized using domain-driven modular boundaries:

```text
├── api/                   # Serverless entrypoint (Vercel)
│   └── index.ts
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma
├── prisma.config.ts       # Prisma 7 connection configuration
├── src/
│   ├── config/            # DB client (adapter-pg) & Swagger spec
│   ├── lib/               # Custom errors and shared helpers
│   ├── middlewares/       # Auth session guard, admin check & error handler
│   ├── modules/
│   │   ├── auth/          # Better Auth initialization & routes
│   │   ├── clubs/         # Club management (CRUD, admin-restricted writes)
│   │   ├── hackathons/    # Hackathon events, scheduling & attendee limits
│   │   └── rsvps/         # RSVP creation, idempotency & capacity validation
│   ├── types/             # Express Request augmentation (user, session)
│   ├── app.ts             # Express app setup and middleware pipeline
│   └── server.ts          # Server listener
├── Dockerfile
├── docker-compose.yml
└── vercel.json
```

---

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hackathon_rsvp?schema=public"
PORT=3000
BETTER_AUTH_SECRET="your-secure-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:5173"
```

---

## Getting Started

### Option 1: Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run database migrations / generate client:**
   ```bash
   pnpm db:push
   # or
   pnpm db:migrate
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

   The API will be available at `http://localhost:3000`.
   OpenAPI documentation is hosted at `http://localhost:3000/api/docs`.

### Option 2: Docker Compose

Start the Postgres database and API server in a single command:

```bash
docker compose up --build
```

---

## API Endpoints Overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | API status and link to docs | Public |
| `GET` | `/api/health` | Health check | Public |
| `GET` | `/api/docs` | Swagger UI documentation | Public |
| `ALL` | `/api/auth/*` | Better Auth endpoints (sign-up, sign-in, session) | Public / Session |
| `GET` | `/api/clubs` | List all clubs | Public |
| `GET` | `/api/clubs/:id` | Get club details | Public |
| `POST` | `/api/clubs` | Create a new club | Admin |
| `PATCH`| `/api/clubs/:id` | Update a club | Admin |
| `DELETE`| `/api/clubs/:id` | Delete a club | Admin |
| `GET` | `/api/hackathons` | List hackathons (optional `?clubId=` filter) | Public |
| `GET` | `/api/hackathons/:id` | Get hackathon details | Public |
| `POST` | `/api/hackathons` | Create a new hackathon | Admin |
| `PATCH`| `/api/hackathons/:id` | Update a hackathon | Admin |
| `DELETE`| `/api/hackathons/:id` | Delete a hackathon | Admin |
| `GET` | `/api/hackathons/:id/rsvps` | View attendees of a hackathon | Admin |
| `POST` | `/api/rsvps` | RSVP to a hackathon (checks max capacity) | User |
| `GET` | `/api/rsvps/me` | View user's RSVPs | User |
| `DELETE`| `/api/rsvps/:hackathonId`| Cancel an RSVP | User |

---

## Database Management Scripts

- `pnpm db:generate` – Generate Prisma client
- `pnpm db:push` – Push schema changes directly to the database
- `pnpm db:migrate` – Run Prisma migration files
- `pnpm db:studio` – Launch Prisma Studio GUI
- `pnpm typecheck` – Run TypeScript type checking
- `pnpm build` – Compile TypeScript into `dist/`
