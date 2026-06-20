const express = require('express');
const DataService = require('../services/dataService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/search', authenticate, async (req, res) => {
  const q = req.query.q || '';
  if (q.length < 2) return res.json([]);
  const results = await DataService.searchCustomers(q);
  res.json(results);
});

router.get('/profile', authenticate, async (req, res) => {
  const profile = await DataService.getCustomerProfile(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

router.get('/loyalty', authenticate, async (req, res) => {
  const profile = await DataService.getCustomerProfile(req.user.id);
  const tiers = [
    { name: 'Bronze', min: 0, benefits: ['1 point per ₱10', 'Birthday drink'] },
    { name: 'Silver', min: 500, benefits: ['1.5x points', 'Free upsize monthly'] },
    { name: 'Gold', min: 2000, benefits: ['2x points', 'Priority queue', 'Exclusive menu'] },
    { name: 'Platinum', min: 5000, benefits: ['3x points', 'Free pastry weekly', 'VIP events'] },
  ];
  res.json({
    points: profile?.loyaltyPoints || 0,
    tier: profile?.loyaltyTier || 'Bronze',
    totalSpent: profile?.totalSpent || 0,
    totalOrders: profile?.totalOrders || 0,
    tiers,
    nextTier: tiers.find(t => (profile?.loyaltyPoints || 0) < t.min) || null,
  });
});

module.exports = router;
