const express = require('express');
const DataService = require('../services/dataService');

const router = express.Router();

router.get('/categories', async (req, res) => {
  res.json(await DataService.getCategories());
});

router.get('/products', async (req, res) => {
  const { category, search, featured, seasonal } = req.query;
  const products = await DataService.getProducts({
    category, search, featured: featured === 'true', seasonal: seasonal === 'true',
  });
  res.json(products);
});

router.get('/products/:id', async (req, res) => {
  const product = await DataService.getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.get('/add-ons', async (req, res) => {
  res.json(await DataService.getAddOns());
});

module.exports = router;
