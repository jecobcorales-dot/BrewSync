const axios = require('axios');
const { getRecommendations } = require('../data/mockData');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function fetchMLRecommendations({ userId, contextProduct, hour, dayOfWeek, algorithm = 'ensemble' }) {
  try {
    const { data } = await axios.post(`${ML_URL}/recommend`, {
      user_id: userId,
      context_product: contextProduct,
      hour: hour ?? new Date().getHours(),
      day_of_week: dayOfWeek ?? new Date().getDay(),
      algorithm,
    }, { timeout: 5000 });

    return data.recommendations.map(r => ({
      productId: r.product_id,
      confidence: r.confidence,
      algorithm: r.algorithm,
      reason: r.reason,
      item: r.product ? {
        id: r.product_id,
        name: r.product.name,
        price: r.product.price,
        category: r.product.category,
      } : null,
      itemType: r.product?.category === 'addon' ? 'addon' : 'product',
    }));
  } catch (err) {
    console.warn('ML service unavailable, using local engine:', err.message);
    return getRecommendations(userId, contextProduct);
  }
}

async function checkMLHealth() {
  try {
    const { data } = await axios.get(`${ML_URL}/health`, { timeout: 3000 });
    return { status: 'online', ...data };
  } catch {
    return { status: 'offline' };
  }
}

module.exports = { fetchMLRecommendations, checkMLHealth };
