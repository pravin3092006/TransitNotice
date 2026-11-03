import express from 'express';
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

  // 1. Initialize SQLite Database & Tables
  initDatabase();
  console.log('✅ TransitNotice SQLite database initialized successfully.');

  // 2. Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. API Routes
  app.use('/api', apiRouter);

  // 4. Background Automated Scheduler (every 15 minutes by default)
  const runSchedulerCycle = async () => {
    try {
      console.log('⏱️ [Scheduler] Running automated freshness cycle...');
      refreshAdvisoriesStatus();
      // Automated background check
      await refreshAllSources();
      console.log('⏱️ [Scheduler] Freshness cycle complete.');
    } catch (err: any) {
      console.error('❌ [Scheduler Error]:', err.message);
    }
  };

  // Run initial scheduler check after 5 seconds to warm up data
  setTimeout(runSchedulerCycle, 5000);

  // Interval check every 5 minutes (checks expiration & schedule)
  const schedulerTimer = setInterval(runSchedulerCycle, 5 * 60 * 1000);

  // 5. Frontend Integration (Vite in dev, static dist in prod)
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        allowedHosts: true,
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

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TransitNotice Server listening on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('🛑 Gracefully shutting down TransitNotice server...');
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
