const express = require('express');
const bcrypt = require('bcryptjs');
const DataService = require('../services/dataService');
const { signToken, authenticate } = require('../middleware/auth');
const { logAudit } = require('../lib/audit');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await DataService.findUserByEmail(email);
  const hash = user?.passwordHash || user?.password_hash;
  if (!user || !bcrypt.compareSync(password, hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (role && user.role !== role) {
    return res.status(403).json({ error: `This account is not authorized for ${role} access` });
  }

  const token = signToken(user);
  const customer = user.customer || (await DataService.getCustomerProfile(user.id));

  res.json({
    token,
    user: {
      id: user.id, email: user.email, role: user.role,
      firstName: user.firstName || user.first_name,
      lastName: user.lastName || user.last_name,
      avatarUrl: user.avatarUrl || user.avatar_url,
      loyaltyPoints: customer?.loyaltyPoints,
      loyaltyTier: customer?.loyaltyTier,
    },
  });
});

router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const existing = await DataService.findUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const user = await DataService.createUser({
    email, passwordHash: bcrypt.hashSync(password, 10),
    role: 'customer', firstName, lastName,
  });

  await logAudit({ action: 'USER_REGISTERED', entityType: 'user', entityId: user.id, details: { email } });
  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, role: 'customer', firstName, lastName, loyaltyPoints: 100, loyaltyTier: 'Bronze' },
  });
});

router.post('/forgot-password', async (req, res) => {
  res.json({ message: 'If an account exists, a reset link has been sent' });
});

router.post('/google', async (req, res) => {
  const { email, firstName, lastName } = req.body;
  let user = await DataService.findUserByEmail(email);
  if (!user) {
    user = await DataService.createUser({
      email, passwordHash: bcrypt.hashSync(require('uuid').v4(), 10),
      role: 'customer', firstName: firstName || 'Guest', lastName: lastName || 'User',
    });
  }
  const customer = await DataService.getCustomerProfile(user.id);
  const token = signToken(user);
  res.json({
    token,
    user: {
      id: user.id, email: user.email, role: user.role,
      firstName: user.firstName, lastName: user.lastName,
      loyaltyPoints: customer?.loyaltyPoints, loyaltyTier: customer?.loyaltyTier,
    },
  });
});

router.get('/me', authenticate, async (req, res) => {
  const profile = await DataService.getCustomerProfile(req.user.id);
  const user = await DataService.findUserByEmail(req.user.email);
  res.json({
    id: req.user.id, email: req.user.email, role: req.user.role,
    firstName: user?.firstName, lastName: user?.lastName,
    loyaltyPoints: profile?.loyaltyPoints, loyaltyTier: profile?.loyaltyTier,
  });
});

module.exports = router;
