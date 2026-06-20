const express = require('express');
const DataService = require('../services/dataService');
const { fetchMLRecommendations } = require('../services/mlClient');
const { getRecommendations } = require('../data/mockData');
const { authenticate } = require('../middleware/auth');
const { isDbConnected, prisma } = require('../lib/prisma');

const router = express.Router();

async function enrichRecommendations(recs, userId) {
  const products = await DataService.getProducts({});
  const addOns = await DataService.getAddOns();

  return recs.map(r => {
    const pid = r.productId || r.product_id;
    let item = products.find(p => p.id === pid || p.slug === pid);
    if (!item) item = addOns.find(a => a.id === pid);
    const productItem = item || r.item;
    return {
      productId: pid,
      item: productItem ? {
        ...productItem,
        imageUrl: productItem.imageUrl || (productItem.slug ? undefined : undefined),
      } : r.item,
      itemType: r.itemType || (item && !item.categoryId && !item.category ? 'addon' : 'product'),
      confidence: r.confidence || r.confidence_score || 0.75,
      algorithm: r.algorithm || 'ensemble',
      reason: r.reason || 'Recommended for you',
      isRecommended: true,
    };
  }).filter(r => r.item);
}

router.get('/', authenticate, async (req, res) => {
  const { productId } = req.query;
  const userId = req.user.id;

  let mlRecs = await fetchMLRecommendations({ userId, contextProduct: productId });
  if (!mlRecs.length) mlRecs = getRecommendations(userId, productId);

  const personalized = await enrichRecommendations(mlRecs, userId);
  const products = await DataService.getProducts({});
  const drinks = personalized.filter(r => r.itemType === 'product' && r.item?.category?.slug && ['coffee', 'non-coffee', 'tea'].includes(r.item.category.slug));
  const food = personalized.filter(r => r.itemType === 'product' && r.item?.category?.slug && ['pastries', 'desserts', 'sandwiches'].includes(r.item.category.slug));
  const addOnRecs = personalized.filter(r => r.itemType === 'addon');

  const trending = products.filter(p => p.isFeatured).slice(0, 6).map(p => ({
    productId: p.id, item: p, itemType: 'product',
    confidence: 0.65 + Math.random() * 0.25, algorithm: 'xgboost', reason: 'Trending this week',
  }));

  const seasonal = products.filter(p => p.isSeasonal).slice(0, 4).map(p => ({
    productId: p.id, item: p, itemType: 'product',
    confidence: 0.7 + Math.random() * 0.2, algorithm: 'random_forest', reason: 'Seasonal special',
  }));

  res.json({
    personalized,
    drinks: drinks.length ? drinks : personalized.filter(r => r.itemType === 'product').slice(0, 4),
    food: food.length ? food : personalized.filter(r => r.itemType === 'product').slice(1, 5),
    addOns: addOnRecs.length ? addOnRecs : personalized.filter(r => r.itemType === 'addon').slice(0, 3),
    trending: trending.length ? trending : personalized.slice(0, 4),
    seasonal: seasonal.length ? seasonal : trending.slice(0, 2),
  });
});

router.get('/context/:productId', authenticate, async (req, res) => {
  const recs = await fetchMLRecommendations({ userId: req.user.id, contextProduct: req.params.productId });
  const enriched = await enrichRecommendations(recs, req.user.id);
  const product = await DataService.getProduct(req.params.productId);
  res.json({ recommendations: enriched, contextProduct: product });
});

router.post('/accept', authenticate, async (req, res) => {
  const { productId, algorithm, confidence } = req.body;
  if (isDbConnected()) {
    await prisma.recommendation.create({
      data: {
        customerId: req.user.id, productId, algorithm: algorithm || 'ensemble',
        confidenceScore: confidence || 0.8, isAccepted: true,
        reason: 'Customer accepted recommendation',
      },
    });
  }
  res.json({ success: true });
});

module.exports = router;
