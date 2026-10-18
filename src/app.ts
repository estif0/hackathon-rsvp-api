/// <reference path="./types/express.d.ts" />
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./modules/auth/auth";
import { swaggerDocument, swaggerUiOptions } from "./config/swagger";
import { errorHandler } from "./middlewares/error.middleware";

import clubRoutes from "./modules/clubs/club.routes";
import hackathonRoutes from "./modules/hackathons/hackathon.routes";
import rsvpRoutes from "./modules/rsvps/rsvp.routes";

const app = express();

// CORS first, then Better Auth (needs raw stream, must be before express.json), then body parsers
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173", credentials: true }));
app.all(["/api/auth/*splat", "/auth/*splat"], toNodeHandler(auth));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(["/", "/api"], (_req, res) => {
  res.json({
    name: "Hackathon RSVP API",
    status: "healthy",
    docs: "/api/docs",
  });
});

app.get(["/health", "/api/health"], (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(["/api/clubs", "/clubs"], clubRoutes);
app.use(["/api/hackathons", "/hackathons"], hackathonRoutes);
app.use(["/api/rsvps", "/rsvps"], rsvpRoutes);

app.use(["/api/docs", "/docs"], swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));

app.use(errorHandler);

export default app;
