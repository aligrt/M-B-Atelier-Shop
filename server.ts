import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeDatabase } from './server/db.js';
import { authRouter } from './server/auth.js';
import { apiRouter } from './server/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize SQLite Database schema & initial bootstrap
initializeDatabase();

// Security Middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Trust Proxy for Cloud Run / Vercel / NGINX reverse proxies
app.set('trust proxy', 1);

// CORS configuration with explicit trusted origins
const allowedOrigins = (process.env.TRUSTED_ORIGINS || 'https://mbatelier.shop,http://localhost:3000').split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.run.app') || origin.endsWith('.mbatelier.shop')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// Restrictive Security Headers Middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Decoy Honeypot for Automated Reconnaissance Scanners
// Standard probes targeting /admin, /wp-admin, /login return authentic Apache 404
const honeypotTargets = ['/admin', '/admin.html', '/wp-admin', '/wp-login.php', '/login', '/dashboard'];
honeypotTargets.forEach((route) => {
  app.all(route, (_req: Request, res: Response) => {
    res.status(404).send(`<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>404 Not Found</title>
</head><body>
<h1>Not Found</h1>
<p>The requested URL was not found on this server.</p>
<hr>
<address>Apache/2.4.52 (Ubuntu) Server at mbatelier.shop Port 443</address>
</body></html>`);
  });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount Authentication & API Routes
app.use('/api/auth', authRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api', apiRouter);

// Frontend Vite Integration
if (!isProd) {
  // Development Mode: Mount Vite in middleware mode
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Production Mode: Serve built static files from dist/
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));

  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global safe error handler (prevents stack trace disclosure)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: 'Internal Server Error.' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  // Server initialized cleanly
});

export default app;
