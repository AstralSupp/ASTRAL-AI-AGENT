import { Request, Response } from 'express';
import { config } from '../config';
import supabaseService from '../services/supabase.service';
import logger from '../utils/logger';

export async function showLoginPage(_req: Request, res: Response) {
  res.render('login', { error: null });
}

export async function handleLogin(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    // Simple authentication (in production, hash passwords)
    if (
      username === config.admin.username &&
      password === config.admin.password
    ) {
      req.session.isAuthenticated = true;
      logger.info('Admin logged in successfully');
      res.redirect('/admin/dashboard');
    } else {
      logger.warn('Failed login attempt', { username });
      res.render('login', { error: 'Invalid username or password' });
    }
  } catch (error) {
    logger.error('Login error:', error);
    res.render('login', { error: 'An error occurred. Please try again.' });
  }
}

export async function showDashboard(_req: Request, res: Response) {
  try {
    const [stats, logs] = await Promise.all([
      supabaseService.getStats(),
      supabaseService.getRecentLogs(50),
    ]);

    res.render('dashboard', {
      stats,
      logs,
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
}

export function handleLogout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
}
