// src/app.ts
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { toNodeHandler } from "better-auth/node";

// src/modules/auth/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/config/db.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
var connectionString = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/hackathon_rsvp";
var pool = new pg.Pool({ connectionString });
var adapter = new PrismaPg(pool);
var prisma = globalThis.prismaGlobal ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

// src/modules/auth/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-for-dev-and-ci-min-32-chars-long",
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
        input: false
      }
    }
  }
});

// src/config/swagger.ts
var swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Hackathon RSVP API",
    description: "A backend API for tech clubs to manage events, hackathons, and member RSVPs.",
    version: "1.0.0"
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server"
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "better-auth.session_token"
      }
    },
    schemas: {
      Club: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          ownerId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Hackathon: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          date: { type: "string", format: "date-time" },
          maxAttendees: { type: "integer" },
          clubId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Rsvp: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          hackathonId: { type: "string" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" }
        }
      }
    }
  },
  paths: {
    // ── Clubs ────────────────────────────────────────────────────────────
    "/api/clubs": {
      get: {
        tags: ["Clubs"],
        summary: "List all clubs",
        responses: {
          200: {
            description: "A list of clubs",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Club" } }
              }
            }
          }
        }
      },
      post: {
        tags: ["Clubs"],
        summary: "Create a new club (Admin only)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Club created", content: { "application/json": { schema: { $ref: "#/components/schemas/Club" } } } },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden \u2013 Admin only" }
        }
      }
    },
    "/api/clubs/{id}": {
      get: {
        tags: ["Clubs"],
        summary: "Get a club by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Club found", content: { "application/json": { schema: { $ref: "#/components/schemas/Club" } } } },
          404: { description: "Club not found" }
        }
      },
      patch: {
        tags: ["Clubs"],
        summary: "Update a club (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Club updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden \u2013 Admin only" },
          404: { description: "Club not found" }
        }
      },
      delete: {
        tags: ["Clubs"],
        summary: "Delete a club (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Club deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden \u2013 Admin only" },
          404: { description: "Club not found" }
        }
      }
    },
    // ── Hackathons ───────────────────────────────────────────────────────
    "/api/hackathons": {
      get: {
        tags: ["Hackathons"],
        summary: "List all hackathons",
        parameters: [
          { name: "clubId", in: "query", required: false, schema: { type: "string" }, description: "Filter by club" }
        ],
        responses: {
          200: {
            description: "A list of hackathons",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Hackathon" } } } }
          }
        }
      },
      post: {
        tags: ["Hackathons"],
        summary: "Create a new hackathon (Admin only)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "date", "maxAttendees", "clubId"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  maxAttendees: { type: "integer" },
                  clubId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Hackathon created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden \u2013 Admin only" }
        }
      }
    },
    "/api/hackathons/{id}": {
      get: {
        tags: ["Hackathons"],
        summary: "Get a hackathon by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Hackathon found", content: { "application/json": { schema: { $ref: "#/components/schemas/Hackathon" } } } },
          404: { description: "Hackathon not found" }
        }
      },
      patch: {
        tags: ["Hackathons"],
        summary: "Update a hackathon (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  maxAttendees: { type: "integer" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Hackathon updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden \u2013 Admin only" },
          404: { description: "Hackathon not found" }
        }
      },
      delete: {
        tags: ["Hackathons"],
        summary: "Delete a hackathon (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Hackathon deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden \u2013 Admin only" },
          404: { description: "Hackathon not found" }
        }
      }
    },
    // ── RSVPs ────────────────────────────────────────────────────────────
    "/api/rsvps": {
      post: {
        tags: ["RSVPs"],
        summary: "RSVP to a hackathon",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["hackathonId"],
                properties: {
                  hackathonId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "RSVP created", content: { "application/json": { schema: { $ref: "#/components/schemas/Rsvp" } } } },
          400: { description: "Hackathon is at full capacity" },
          401: { description: "Unauthorized" },
          409: { description: "Already RSVPed to this hackathon" }
        }
      }
    },
    "/api/rsvps/me": {
      get: {
        tags: ["RSVPs"],
        summary: "Get the current user's RSVPs",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "List of RSVPs",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Rsvp" } } } }
          },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/rsvps/{hackathonId}": {
      delete: {
        tags: ["RSVPs"],
        summary: "Cancel an RSVP",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "hackathonId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "RSVP cancelled" },
          401: { description: "Unauthorized" },
          404: { description: "RSVP not found" }
        }
      }
    },
    "/api/hackathons/{id}/rsvps": {
      get: {
        tags: ["Hackathons"],
        summary: "List all attendees for a hackathon (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "List of RSVPs with user info",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    allOf: [
                      { $ref: "#/components/schemas/Rsvp" },
                      {
                        type: "object",
                        properties: {
                          user: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              name: { type: "string" },
                              email: { type: "string" }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden \u2013 Admin only" },
          404: { description: "Hackathon not found" }
        }
      }
    }
  }
};
var swaggerUiOptions = {
  customSiteTitle: "Hackathon RSVP API Docs"
};

// src/middlewares/error.middleware.ts
import { Prisma } from "@prisma/client";

// src/lib/errors.ts
var HttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
  status;
};

// src/middlewares/error.middleware.ts
var PRISMA_ERROR_MAP = {
  P2002: { status: 409, message: "A record with this value already exists." },
  P2025: { status: 404, message: "Record not found." },
  P2003: { status: 400, message: "Related record not found." }
};
var errorHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERROR_MAP[err.code];
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }
    res.status(500).json({ message: "A database error occurred." });
    return;
  }
  if (err instanceof Error) {
    res.status(500).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: "An unexpected error occurred." });
};

// src/modules/clubs/club.routes.ts
import { Router } from "express";

// src/middlewares/auth.middleware.ts
import { fromNodeHeaders } from "better-auth/node";
var requireAuth = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    req.user = session.user;
    req.session = session.session;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
var requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Forbidden: Admin access required" });
    return;
  }
  next();
};

// src/modules/clubs/club.service.ts
var getAllClubs = async () => {
  return prisma.club.findMany({
    include: { _count: { select: { hackathons: true } } },
    orderBy: { createdAt: "desc" }
  });
};
var getClubById = async (id) => {
  const club = await prisma.club.findUnique({
    where: { id },
    include: { hackathons: true }
  });
  if (!club) throw new HttpError(404, "Club not found");
  return club;
};
var createClub = async (ownerId, data) => {
  return prisma.club.create({
    data: { ...data, ownerId }
  });
};
var updateClub = async (id, data) => {
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) throw new HttpError(404, "Club not found");
  return prisma.club.update({ where: { id }, data });
};
var deleteClub = async (id) => {
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) throw new HttpError(404, "Club not found");
  return prisma.club.delete({ where: { id } });
};

// src/modules/clubs/club.controller.ts
var getClubs = async (_req, res, next) => {
  try {
    res.json(await getAllClubs());
  } catch (err) {
    next(err);
  }
};
var getClub = async (req, res, next) => {
  try {
    res.json(await getClubById(req.params.id));
  } catch (err) {
    next(err);
  }
};
var createClub2 = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ message: "name is required" });
      return;
    }
    const club = await createClub(req.user.id, { name, description });
    res.status(201).json(club);
  } catch (err) {
    next(err);
  }
};
var updateClub2 = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    res.json(await updateClub(req.params.id, { name, description }));
  } catch (err) {
    next(err);
  }
};
var deleteClub2 = async (req, res, next) => {
  try {
    await deleteClub(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// src/modules/clubs/club.routes.ts
var router = Router();
router.get("/", getClubs);
router.get("/:id", getClub);
router.post("/", requireAuth, requireAdmin, createClub2);
router.patch("/:id", requireAuth, requireAdmin, updateClub2);
router.delete("/:id", requireAuth, requireAdmin, deleteClub2);
var club_routes_default = router;

// src/modules/hackathons/hackathon.routes.ts
import { Router as Router2 } from "express";

// src/modules/hackathons/hackathon.service.ts
var getAllHackathons = async (clubId) => {
  return prisma.hackathon.findMany({
    where: clubId ? { clubId } : void 0,
    include: { _count: { select: { rsvps: true } } },
    orderBy: { date: "asc" }
  });
};
var getHackathonById = async (id) => {
  const hackathon = await prisma.hackathon.findUnique({
    where: { id },
    include: { _count: { select: { rsvps: true } }, club: true }
  });
  if (!hackathon) throw new HttpError(404, "Hackathon not found");
  return hackathon;
};
var createHackathon = async (data) => {
  const clubExists = await prisma.club.findUnique({ where: { id: data.clubId } });
  if (!clubExists) throw new HttpError(404, "Club not found");
  return prisma.hackathon.create({ data });
};
var updateHackathon = async (id, data) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id } });
  if (!hackathon) throw new HttpError(404, "Hackathon not found");
  return prisma.hackathon.update({ where: { id }, data });
};
var deleteHackathon = async (id) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id } });
  if (!hackathon) throw new HttpError(404, "Hackathon not found");
  return prisma.hackathon.delete({ where: { id } });
};
var getHackathonRsvps = async (id) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id } });
  if (!hackathon) throw new HttpError(404, "Hackathon not found");
  return prisma.rsvp.findMany({
    where: { hackathonId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" }
  });
};

// src/modules/hackathons/hackathon.controller.ts
var getHackathons = async (req, res, next) => {
  try {
    const { clubId } = req.query;
    res.json(await getAllHackathons(clubId));
  } catch (err) {
    next(err);
  }
};
var getHackathon = async (req, res, next) => {
  try {
    res.json(await getHackathonById(req.params.id));
  } catch (err) {
    next(err);
  }
};
var createHackathon2 = async (req, res, next) => {
  try {
    const { title, description, date, maxAttendees, clubId } = req.body;
    if (!title?.trim() || !date || !maxAttendees || !clubId) {
      res.status(400).json({ message: "title, date, maxAttendees, and clubId are required" });
      return;
    }
    const hackathon = await createHackathon({
      title,
      description,
      date: new Date(date),
      maxAttendees: Number(maxAttendees),
      clubId
    });
    res.status(201).json(hackathon);
  } catch (err) {
    next(err);
  }
};
var updateHackathon2 = async (req, res, next) => {
  try {
    const { title, description, date, maxAttendees } = req.body;
    res.json(
      await updateHackathon(req.params.id, {
        title,
        description,
        ...date && { date: new Date(date) },
        ...maxAttendees && { maxAttendees: Number(maxAttendees) }
      })
    );
  } catch (err) {
    next(err);
  }
};
var deleteHackathon2 = async (req, res, next) => {
  try {
    await deleteHackathon(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
var getHackathonAttendees = async (req, res, next) => {
  try {
    res.json(await getHackathonRsvps(req.params.id));
  } catch (err) {
    next(err);
  }
};

// src/modules/hackathons/hackathon.routes.ts
var router2 = Router2();
router2.get("/", getHackathons);
router2.get("/:id", getHackathon);
router2.get("/:id/rsvps", requireAuth, requireAdmin, getHackathonAttendees);
router2.post("/", requireAuth, requireAdmin, createHackathon2);
router2.patch("/:id", requireAuth, requireAdmin, updateHackathon2);
router2.delete("/:id", requireAuth, requireAdmin, deleteHackathon2);
var hackathon_routes_default = router2;

// src/modules/rsvps/rsvp.routes.ts
import { Router as Router3 } from "express";

// src/modules/rsvps/rsvp.service.ts
var createRsvp = async (userId, hackathonId) => {
  return prisma.$transaction(async (tx) => {
    const hackathon = await tx.hackathon.findUnique({
      where: { id: hackathonId },
      include: { _count: { select: { rsvps: true } } }
    });
    if (!hackathon) throw new HttpError(404, "Hackathon not found");
    if (hackathon._count.rsvps >= hackathon.maxAttendees) {
      throw new HttpError(400, "Hackathon is at full capacity");
    }
    const existing = await tx.rsvp.findUnique({
      where: { userId_hackathonId: { userId, hackathonId } }
    });
    if (existing) throw new HttpError(409, "You have already RSVPed to this hackathon");
    return tx.rsvp.create({
      data: { userId, hackathonId },
      include: { hackathon: true }
    });
  });
};
var getMyRsvps = async (userId) => {
  return prisma.rsvp.findMany({
    where: { userId },
    include: { hackathon: { include: { club: true } } },
    orderBy: { createdAt: "desc" }
  });
};
var deleteRsvp = async (userId, hackathonId) => {
  const rsvp = await prisma.rsvp.findUnique({
    where: { userId_hackathonId: { userId, hackathonId } }
  });
  if (!rsvp) throw new HttpError(404, "RSVP not found");
  return prisma.rsvp.delete({
    where: { userId_hackathonId: { userId, hackathonId } }
  });
};

// src/modules/rsvps/rsvp.controller.ts
var createRsvp2 = async (req, res, next) => {
  try {
    const { hackathonId } = req.body;
    if (!hackathonId) {
      res.status(400).json({ message: "hackathonId is required" });
      return;
    }
    const rsvp = await createRsvp(req.user.id, hackathonId);
    res.status(201).json(rsvp);
  } catch (err) {
    next(err);
  }
};
var getMyRsvps2 = async (req, res, next) => {
  try {
    res.json(await getMyRsvps(req.user.id));
  } catch (err) {
    next(err);
  }
};
var deleteRsvp2 = async (req, res, next) => {
  try {
    await deleteRsvp(req.user.id, req.params.hackathonId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// src/modules/rsvps/rsvp.routes.ts
var router3 = Router3();
router3.use(requireAuth);
router3.post("/", createRsvp2);
router3.get("/me", getMyRsvps2);
router3.delete("/:hackathonId", deleteRsvp2);
var rsvp_routes_default = router3;

// src/app.ts
var app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173", credentials: true }));
app.all(["/api/auth/*splat", "/auth/*splat"], toNodeHandler(auth));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get(["/", "/api"], (_req, res) => {
  res.json({
    name: "Hackathon RSVP API",
    status: "healthy",
    docs: "/api/docs"
  });
});
app.get(["/health", "/api/health"], (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use(["/api/clubs", "/clubs"], club_routes_default);
app.use(["/api/hackathons", "/hackathons"], hackathon_routes_default);
app.use(["/api/rsvps", "/rsvps"], rsvp_routes_default);
app.use(["/api/docs", "/docs"], swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));
app.use(errorHandler);
var app_default = app;
export {
  app_default as default
};
