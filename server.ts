import express from 'express';
import session from 'express-session';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { initDatabase, db } from './src/server/db.js';
import { apiRouter } from './src/server/api.js';
import { refreshAllSources } from './src/server/scrapers.js';
import { refreshAdvisoriesStatus } from './src/server/changeDetector.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Initialize SQLite Database
  initDatabase();
  console.log('TransitNotice SQLite database initialized successfully.');

  // 2. Middleware
  app.set('trust proxy', 1);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. Session Middleware
  app.use(
    session({
      name: 'transitnotice.sid',
      secret: process.env.SESSION_SECRET || 'temporary-development-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      }
    })
  );

  // 4. API Routes
  app.use('/api', apiRouter);

  // 5. Background Automated Scheduler
  const runSchedulerCycle = async () => {
    try {
      console.log('[Scheduler] Running automated freshness cycle...');
      refreshAdvisoriesStatus();
      await refreshAllSources();
      console.log('[Scheduler] Freshness cycle complete.');
    } catch (err: any) {
      console.error('[Scheduler Error]:', err.message);
    }
  };

  // Initial scheduler check
  setTimeout(runSchedulerCycle, 5000);

  // Run every 5 minutes
  const schedulerTimer = setInterval(
    runSchedulerCycle,
    5 * 60 * 1000
  );

  // 6. Frontend Integration
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        allowedHosts: true
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // 7. Start Server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `TransitNotice Server listening on port ${PORT}`
    );
  });

  // 8. Graceful Shutdown
  const shutdown = () => {
    console.log('Shutting down TransitNotice server...');

    clearInterval(schedulerTimer);

    server.close(() => {
      db.close();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
