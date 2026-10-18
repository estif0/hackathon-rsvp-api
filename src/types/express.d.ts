import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image?: string | null;
      createdAt: Date;
      updatedAt: Date;
      role?: string | null;
    };
    session?: {
      id: string;
      userId: string;
      token: string;
      expiresAt: Date;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image?: string | null;
        createdAt: Date;
        updatedAt: Date;
        role?: string | null;
      };
      session?: {
        id: string;
        userId: string;
        token: string;
        expiresAt: Date;
      };
    }
  }
}
