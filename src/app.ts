import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./modules/auth/auth.js";
import { swaggerDocument, swaggerUiOptions } from "./config/swagger.js";
import { errorHandler } from "./middlewares/error.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import clubRoutes from "./modules/clubs/club.routes.js";
import hackathonRoutes from "./modules/hackathons/hackathon.routes.js";
import rsvpRoutes from "./modules/rsvps/rsvp.routes.js";

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL MIDDLEWARE ORDER
// 1. CORS must come first so pre-flight requests are handled
// 2. Better Auth handler BEFORE express.json() — it needs the raw request stream
// 3. Body parsers AFTER Better Auth
// ─────────────────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true, // required for Better Auth cookie-based sessions
  })
);

// Better Auth handles all /api/auth/* routes
app.all("/api/auth/*splat", toNodeHandler(auth));

// Body parsers — AFTER Better Auth
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/rsvps", rsvpRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// API Docs (Swagger UI)
// ─────────────────────────────────────────────────────────────────────────────

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));

// ─────────────────────────────────────────────────────────────────────────────
// Global Error Handler (must be last)
// ─────────────────────────────────────────────────────────────────────────────

app.use(errorHandler);

export default app;
