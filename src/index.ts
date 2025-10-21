import express, { Express } from 'express';
import session from 'express-session';
import path from 'path';
import { config, validateConfig } from './config';
import { handleChatwootWebhook, healthCheck } from './controllers/webhook.controller';
import {
  showLoginPage,
  handleLogin,
  showDashboard,
  handleLogout,
} from './controllers/admin.controller';
import { requireAuth, redirectIfAuthenticated } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import logger from './utils/logger';

// Validate configuration on startup
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error('Configuration validation failed:', error);
  process.exit(1);
}

const app: Express = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'astral-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.server.nodeEnv === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
app.use(requestLogger);

// Public Routes
app.get('/health', healthCheck);
app.post('/webhooks/chatwoot', handleChatwootWebhook);

// Admin Routes
app.get('/admin/login', redirectIfAuthenticated, showLoginPage);
app.post('/admin/login', redirectIfAuthenticated, handleLogin);
app.get('/admin/dashboard', requireAuth, showDashboard);
app.post('/admin/logout', handleLogout);

// Redirect root to admin dashboard
app.get('/', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login');
  }
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`🚀 ASTRAL AI Agent started on port ${PORT}`);
  logger.info(`Environment: ${config.server.nodeEnv}`);
  logger.info(`Agent: ${config.agent.name}`);
  logger.info(`Business: ${config.agent.businessName}`);
  logger.info(`Admin Dashboard: http://localhost:${PORT}/admin`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
