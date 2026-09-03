// Extends Express's Request interface to include the authenticated user.
// This is populated by the auth middleware after verifying a Better Auth session.

import type { Session, User } from "better-auth/types";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}
