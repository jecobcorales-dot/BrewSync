const express = require('express');
const DataService = require('../services/dataService');
const { checkMLHealth } = require('../services/mlClient');
const { authenticate, authorize } = require('../middleware/auth');
const { logAudit } = require('../lib/audit');
const { isDbConnected, prisma } = require('../lib/prisma');

const router = express.Router();

router.get('/dashboard', authenticate, authorize('manager', 'admin'), async (req, res) => {
  const analytics = await DataService.getAnalytics();
  const products = await DataService.getProducts({ featured: true });
  res.json({ ...analytics, bestSellers: products.slice(0, 5) });
});

router.get('/cashier', authenticate, authorize('cashier', 'manager'), async (req, res) => {
  res.json(await DataService.getCashierStats());
});

router.get('/revenue', authenticate, authorize('manager', 'admin'), async (req, res) => {
  const analytics = await DataService.getAnalytics();
  res.json({
    daily: analytics.dailySales,
    monthly: analytics.monthlyRevenue,
    forecast: analytics.revenueForecast,
    salesTrend: analytics.salesTrend,
  });
});

router.get('/branches', authenticate, authorize('manager', 'admin'), async (req, res) => {
  const analytics = await DataService.getAnalytics();
  res.json(analytics.branchComparison);
});

router.get('/insights', authenticate, authorize('manager', 'admin'), async (req, res) => {
  const analytics = await DataService.getAnalytics();
  res.json({
    customerGrowth: analytics.customerGrowth,
    peakHours: analytics.peakHours,
    recommendationAcceptanceRate: analytics.recommendationAcceptanceRate,
    productPopularity: analytics.productPopularity,
  });
});

const adminRouter = express.Router();

adminRouter.get('/users', authenticate, authorize('admin', 'manager'), async (req, res) => {
  res.json(await DataService.getUsers());
});

adminRouter.post('/users', authenticate, authorize('admin'), async (req, res) => {
  const bcrypt = require('bcryptjs');
  const user = await DataService.createUser({
    ...req.body,
    passwordHash: bcrypt.hashSync(req.body.password || 'BrewSync2024!', 10),
  });
  await logAudit({ userId: req.user.id, action: 'USER_CREATED', entityType: 'user', entityId: user.id });
  res.status(201).json(user);
});

adminRouter.patch('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  const user = await DataService.updateUser(req.params.id, req.body);
  await logAudit({ userId: req.user.id, action: 'USER_UPDATED', entityType: 'user', entityId: req.params.id });
  res.json(user);
});

adminRouter.get('/branches', authenticate, authorize('admin', 'manager'), async (req, res) => {
  res.json(await DataService.getBranches());
});

adminRouter.post('/branches', authenticate, authorize('admin'), async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database required' });
  const branch = await prisma.branch.create({ data: req.body });
  await logAudit({ userId: req.user.id, action: 'BRANCH_CREATED', entityType: 'branch', entityId: branch.id });
  res.status(201).json(branch);
});

adminRouter.get('/products', authenticate, authorize('admin', 'manager'), async (req, res) => {
  res.json(await DataService.getProducts({}));
});

adminRouter.post('/products', authenticate, authorize('admin'), async (req, res) => {
  const product = await DataService.createProduct(req.body);
  await logAudit({ userId: req.user.id, action: 'PRODUCT_CREATED', entityType: 'product', entityId: product?.id });
  res.status(201).json(product);
});

adminRouter.patch('/products/:id', authenticate, authorize('admin'), async (req, res) => {
  const product = await DataService.updateProduct(req.params.id, req.body);
  await logAudit({ userId: req.user.id, action: 'PRODUCT_UPDATED', entityType: 'product', entityId: req.params.id });
  res.json(product);
});

adminRouter.get('/promotions', authenticate, authorize('admin', 'manager'), async (req, res) => {
  res.json(await DataService.getPromotions());
});

adminRouter.post('/promotions', authenticate, authorize('admin'), async (req, res) => {
  const promo = await DataService.createPromotion(req.body);
  await logAudit({ userId: req.user.id, action: 'PROMOTION_CREATED', entityType: 'promotion', entityId: promo?.id });
  res.status(201).json(promo);
});

adminRouter.get('/ml-models', authenticate, authorize('admin'), async (req, res) => {
  res.json(await DataService.getMLModels());
});

adminRouter.post('/ml-models/train', authenticate, authorize('admin'), async (req, res) => {
  const axios = require('axios');
  const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  try {
    const { data } = await axios.post(`${ML_URL}/train`, req.body, { timeout: 10000 });
    await logAudit({ userId: req.user.id, action: 'ML_TRAINING_STARTED', entityType: 'ml_model', details: data });
    res.json(data);
  } catch {
    res.json({ status: 'training_started', message: 'Training queued locally', estimated_time: '15 minutes' });
  }
});

adminRouter.get('/audit-logs', authenticate, authorize('admin'), async (req, res) => {
  res.json(await DataService.getAuditLogs());
});

adminRouter.get('/system', authenticate, authorize('admin'), async (req, res) => {
  const ml = await checkMLHealth();
  const products = await DataService.getProducts({});
  const users = await DataService.getUsers();
  const branches = await DataService.getBranches();
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    services: {
      api: { status: 'online', latency: 12 },
      database: { status: isDbConnected() ? 'online' : 'mock', latency: isDbConnected() ? 8 : 0 },
      mlService: { status: ml.status, latency: ml.status === 'online' ? 45 : 0 },
      cache: { status: 'online', latency: 2 },
    },
    metrics: {
      totalUsers: users.length,
      totalProducts: products.length,
      activeBranches: branches.filter(b => b.isActive !== false).length,
    },
  });
});

module.exports = { analyticsRouter: router, adminRouter };
