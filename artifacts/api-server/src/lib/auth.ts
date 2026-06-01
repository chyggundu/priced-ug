import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const adminUserId = process.env.ADMIN_USER_ID;
  if (!adminUserId || userId !== adminUserId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  req.userId = userId;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = getAuth(req);
  req.userId = auth?.userId ?? undefined;
  next();
}
