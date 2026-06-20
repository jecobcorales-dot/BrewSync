const express = require('express');
const DataService = require('../services/dataService');
const { authenticate, authorize } = require('../middleware/auth');
const { emitOrderCreated, emitOrderUpdated } = require('../socket');
const { logAudit } = require('../lib/audit');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  res.json(await DataService.getOrders(req.user));
});

router.get('/queue', authenticate, authorize('cashier', 'manager'), async (req, res) => {
  res.json(await DataService.getOrderQueue());
});

router.get('/:id', authenticate, async (req, res) => {
  const order = await DataService.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.post('/', authenticate, async (req, res) => {
  const { items, branchId, notes, paymentMethod } = req.body;
  if (!items?.length) return res.status(400).json({ error: 'Order must contain items' });

  const order = await DataService.createOrder({
    items,
    branchId: branchId || (await DataService.getBranches())[0]?.id,
    customerId: req.user.role === 'customer' ? req.user.id : req.body.customerId,
    cashierId: req.user.role === 'cashier' ? req.user.id : null,
    notes,
    paymentMethod,
  });

  emitOrderCreated(order);
  await logAudit({ userId: req.user.id, action: 'ORDER_CREATED', entityType: 'order', entityId: order.id, details: { total: order.total } });
  res.status(201).json(order);
});

router.patch('/:id/status', authenticate, authorize('cashier', 'manager', 'admin'), async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const order = await DataService.updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  emitOrderUpdated(order);
  await logAudit({ userId: req.user.id, action: 'ORDER_STATUS_UPDATED', entityType: 'order', entityId: order.id, details: { status } });
  res.json(order);
});

module.exports = router;
