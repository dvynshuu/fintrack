import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './db/index.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { accountsRouter } from './modules/accounts/accounts.routes.js';
import { transactionsRouter } from './modules/transactions/transactions.routes.js';
import { goalsRouter } from './modules/goals/goals.routes.js';
import { analyticsRouter } from './modules/analytics/analytics.routes.js';
import { reconciliationRouter } from './modules/reconciliation/reconciliation.routes.js';
import { aiRouter } from './modules/ai/ai.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { subscriptionsRouter } from './modules/transactions/subscriptions.routes.js';

// Initialize Relational Database Schema & System Seeds
initializeDatabase();

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
app.use(cors({
  origin: true, // Allow frontend dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request Body Parser
app.use(express.json({ limit: '10mb' }));

// Rate Limiting on Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // 100 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Please try again later.' } }
});

// Observability & Health Checks
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    memoryUsage: process.memoryUsage(),
    engine: 'FinTrack Modular Monolith v3.0'
  });
});

app.get('/ready', (req: Request, res: Response) => {
  res.json({
    ready: true,
    database: 'connected',
    version: '3.0.0'
  });
});

// Modular Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api', analyticsRouter);
app.use('/api', reconciliationRouter);
app.use('/api', aiRouter);
app.use('/api', subscriptionsRouter);
app.use('/api/users', usersRouter);

// Backward Compatibility Direct Aliases
// Expenses
app.get('/api/expenses', (req, res, next) => {
  req.query.type = 'expense';
  transactionsRouter(req, res, next);
});
app.post('/api/expenses', (req, res, next) => {
  req.body.type = 'expense';
  transactionsRouter(req, res, next);
});
app.put('/api/expenses/:id', (req, res, next) => {
  transactionsRouter(req, res, next);
});
app.delete('/api/expenses/:id', (req, res, next) => {
  transactionsRouter(req, res, next);
});

// Incomes
app.get('/api/incomes', (req, res, next) => {
  req.query.type = 'income';
  transactionsRouter(req, res, next);
});
app.post('/api/incomes', (req, res, next) => {
  req.body.type = 'income';
  transactionsRouter(req, res, next);
});
app.put('/api/incomes/:id', (req, res, next) => {
  transactionsRouter(req, res, next);
});
app.delete('/api/incomes/:id', (req, res, next) => {
  transactionsRouter(req, res, next);
});

// Global Centralized Error Envelope (RFC 7807)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal error occurred.',
      status: err.status || 500,
      timestamp: new Date().toISOString()
    }
  });
});

const PORT = process.env.PORT || 5005;
const server = app.listen(PORT, () => {
  console.log(`[FinTrack Production Engine] Server active on port ${PORT}`);
  console.log(`[Health] http://localhost:${PORT}/health`);
  console.log(`[Ready]  http://localhost:${PORT}/ready`);
});

// Process Signal Termination Handling
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

export default app;
