import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

// Maps Prisma error codes to clean HTTP responses.
const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: "A record with this value already exists." },
  P2025: { status: 404, message: "Record not found." },
  P2003: { status: 400, message: "Related record not found." },
};

/**
 * Global error handling middleware.
 * Catches errors from all route handlers (passed via next(err)).
 * Never leaks raw Prisma error codes to the client.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERROR_MAP[err.code];
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }
    // Unknown Prisma error — don't leak internals
    res.status(500).json({ message: "A database error occurred." });
    return;
  }

  // Handle generic application errors
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status ?? 500;
    res.status(status).json({ message: err.message });
    return;
  }

  // Fallback
  res.status(500).json({ message: "An unexpected error occurred." });
};
