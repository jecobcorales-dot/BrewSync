require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDatabase } = require('./lib/prisma');
const { initSocket } = require('./socket');
const { checkMLHealth } = require('./services/mlClient');

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const recommendationRoutes = require('./routes/recommendations');
const { analyticsRouter, adminRouter } = require('./routes/analytics');
const customerRoutes = require('./routes/customers');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : [
      process.env.FRONTEND_URL || 'https://brewsync.com',
      'https://www.brewsync.com',
      'http://localhost:3000',
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
    ];
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

app.get('/api/health', async (req, res) => {
  const ml = await checkMLHealth();
  res.json({
    status: 'ok',
    service: 'BrewSync API',
    version: '2.0.0',
    database: process.env.DATABASE_URL ? 'configured' : 'mock',
    mlService: ml.status,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/customers', customerRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await connectDatabase();
  initSocket(server);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`☕ BrewSync API v2.0 running on http://0.0.0.0:${PORT}`);
    console.log(`⚡ Socket.IO enabled for real-time orders`);
    console.log(`📱 Access from other devices: http://<your-ip>:${PORT}`);
  });
}

start();
module.exports = app;
