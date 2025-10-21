import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Extend Express Session type
declare module 'express-session' {
  interface SessionData {
    isAuthenticated: boolean;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }

  logger.warn('Unauthorized access attempt to admin panel');
  res.redirect('/admin/login');
}

export function redirectIfAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.isAuthenticated) {
    return res.redirect('/admin/dashboard');
  }
  next();
}
