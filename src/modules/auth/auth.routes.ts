import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";

const router = Router();

// Better Auth handles all /api/auth/* routes natively.
// This handler must be mounted BEFORE express.json() in app.ts.
router.all("/*splat", toNodeHandler(auth));

export default router;
