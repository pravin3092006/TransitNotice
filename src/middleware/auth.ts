import { Request, Response, NextFunction } from 'express';

export interface DecodedToken {
  uid: string;
  email?: string;
  name?: string;
}

export interface AuthRequest extends Request {
  user?: DecodedToken;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const sessionUser = (req as any).session?.user;

  if (!sessionUser?.uid || !sessionUser?.email) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in.'
    });
  }

  req.user = {
    uid: sessionUser.uid,
    email: sessionUser.email,
    name: sessionUser.name
  };

  next();
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const sessionUser = (req as any).session?.user;

  if (sessionUser?.uid && sessionUser?.email) {
    req.user = {
      uid: sessionUser.uid,
      email: sessionUser.email,
      name: sessionUser.name
    };
  }

  next();
};
