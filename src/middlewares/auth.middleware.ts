import type { Request, Response, NextFunction } from "express";
import { auth } from "../modules/auth/auth.js";

/**
 * Verifies the Better Auth session from the request headers/cookies.
 * On success, attaches `req.user` and `req.session` for downstream handlers.
 * On failure, returns 401 Unauthorized.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as Headers });

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

/**
 * Requires the authenticated user to have the "admin" role.
 * Must be used after `requireAuth`.
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Forbidden: Admin access required" });
    return;
  }
  next();
};
