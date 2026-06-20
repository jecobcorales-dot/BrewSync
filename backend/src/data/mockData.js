const bcrypt = require('bcryptjs');

const hash = bcrypt.hashSync('BrewSync2024!', 10);

const branches = [
  { id: 'b1', name: 'BrewSync BGC', code: 'BS-BGC', address: '26th St, Bonifacio Global City', city: 'Taguig', phone: '+63 2 8888 1001', isActive: true },
  { id: 'b2', name: 'BrewSync Makati', code: 'BS-MKT', address: 'Ayala Avenue, Makati City', city: 'Makati', phone: '+63 2 8888 1002', isActive: true },
  { id: 'b3', name: 'BrewSync Quezon City', code: 'BS-QC', address: 'Eastwood City, Quezon City', city: 'Quezon City', phone: '+63 2 8888 1003', isActive: true },
  { id: 'b4', name: 'BrewSync Cebu', code: 'BS-CEB', address: 'IT Park, Cebu City', city: 'Cebu', phone: '+63 32 888 1004', isActive: true },
];

const categories = [
  { id: 'cat1', name: 'Coffee', slug: 'coffee', icon: 'coffee', sortOrder: 1 },
  { id: 'cat2', name: 'Non-Coffee', slug: 'non-coffee', icon: 'glass-water', sortOrder: 2 },
  { id: 'cat3', name: 'Tea', slug: 'tea', icon: 'leaf', sortOrder: 3 },
  { id: 'cat4', name: 'Pastries', slug: 'pastries', icon: 'croissant', sortOrder: 4 },
  { id: 'cat5', name: 'Desserts', slug: 'desserts', icon: 'cake', sortOrder: 5 },
  { id: 'cat6', name: 'Sandwiches', slug: 'sandwiches', icon: 'sandwich', sortOrder: 6 },
];

const products = [
  { id: 'p1', categoryId: 'cat1', name: 'Iced Latte', slug: 'iced-latte', description: 'Smooth espresso with cold milk over ice. Our signature morning pick-me-up.', price: 165, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=400&fit=crop', calories: 180, rating: 4.8, reviewCount: 342, isFeatured: true, tags: ['bestseller', 'iced'] },
  { id: 'p2', categoryId: 'cat1', name: 'Caramel Macchiato', slug: 'caramel-macchiato', description: 'Rich espresso with vanilla syrup, steamed milk, and caramel drizzle.', price: 185, imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop', calories: 250, rating: 4.7, reviewCount: 289, isFeatured: true, tags: ['sweet'] },
  { id: 'p3', categoryId: 'cat1', name: 'Spanish Latte', slug: 'spanish-latte', description: 'Condensed milk meets bold espresso. A Filipino favorite.', price: 175, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop', calories: 220, rating: 4.9, reviewCount: 456, isFeatured: true, tags: ['bestseller'] },
  { id: 'p4', categoryId: 'cat1', name: 'Americano', slug: 'americano', description: 'Double shot espresso with hot water. Clean and bold.', price: 140, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop', calories: 15, rating: 4.5, reviewCount: 198, tags: ['hot'] },
  { id: 'p5', categoryId: 'cat1', name: 'Flat White', slug: 'flat-white', description: 'Velvety microfoam over a double ristretto shot.', price: 170, imageUrl: 'https://images.unsplash.com/photo-1561882468-8940e64f2c28?w=400&h=400&fit=crop', calories: 170, rating: 4.6, reviewCount: 167, tags: ['hot'] },
  { id: 'p6', categoryId: 'cat1', name: 'Cold Brew', slug: 'cold-brew', description: '18-hour steeped cold brew. Smooth with chocolate notes.', price: 155, imageUrl: 'https://images.unsplash.com/photo-1517487881594-27866fef5e58?w=400&h=400&fit=crop', calories: 5, rating: 4.7, reviewCount: 234, tags: ['iced'] },
  { id: 'p7', categoryId: 'cat2', name: 'Matcha Latte', slug: 'matcha-latte', description: 'Premium ceremonial grade matcha with oat milk.', price: 195, imageUrl: 'https://images.unsplash.com/photo-1515823064-d89553993c66?w=400&h=400&fit=crop', calories: 210, rating: 4.8, reviewCount: 312, isFeatured: true, tags: ['bestseller'] },
  { id: 'p8', categoryId: 'cat2', name: 'Dark Chocolate', slug: 'dark-chocolate', description: 'Belgian dark chocolate with steamed milk.', price: 175, imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=400&fit=crop', calories: 320, rating: 4.6, reviewCount: 145, tags: ['sweet'] },
  { id: 'p9', categoryId: 'cat2', name: 'Strawberry Smoothie', slug: 'strawberry-smoothie', description: 'Fresh strawberries blended with yogurt and honey.', price: 185, imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop', calories: 280, rating: 4.5, reviewCount: 178, tags: ['fruity'] },
  { id: 'p10', categoryId: 'cat3', name: 'Earl Grey Tea', slug: 'earl-grey-tea', description: 'Classic bergamot-infused black tea.', price: 120, imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop', calories: 0, rating: 4.4, reviewCount: 89, tags: ['hot'] },
  { id: 'p11', categoryId: 'cat3', name: 'Chamomile Honey', slug: 'chamomile-honey', description: 'Soothing chamomile with local wildflower honey.', price: 130, imageUrl: 'https://images.unsplash.com/photo-1597318181409-1c37daff7b4d?w=400&h=400&fit=crop', calories: 45, rating: 4.5, reviewCount: 67, tags: ['hot'] },
  { id: 'p12', categoryId: 'cat3', name: 'Iced Peach Tea', slug: 'iced-peach-tea', description: 'Refreshing peach-infused black tea over ice.', price: 135, imageUrl: 'https://images.unsplash.com/photo-1556678663-c7306c1976bc?w=400&h=400&fit=crop', calories: 80, rating: 4.6, reviewCount: 156, tags: ['iced'] },
  { id: 'p13', categoryId: 'cat4', name: 'Butter Croissant', slug: 'butter-croissant', description: 'Flaky, buttery layers baked fresh daily.', price: 95, imageUrl: 'https://images.unsplash.com/photo-1555507036-eaa9352d9f0d?w=400&h=400&fit=crop', calories: 270, rating: 4.7, reviewCount: 423, isFeatured: true, tags: ['bestseller'] },
  { id: 'p14', categoryId: 'cat4', name: 'Pain au Chocolat', slug: 'pain-au-chocolat', description: 'Golden pastry wrapped around dark chocolate.', price: 110, imageUrl: 'https://images.unsplash.com/photo-1623334044303-241004436875?w=400&h=400&fit=crop&auto=format', calories: 310, rating: 4.6, reviewCount: 234, tags: [] },
  { id: 'p15', categoryId: 'cat4', name: 'Almond Danish', slug: 'almond-danish', description: 'Sweet almond paste in a crisp pastry shell.', price: 105, imageUrl: 'https://images.unsplash.com/photo-1623334044303-241004436875?w=400&h=400&fit=crop', calories: 290, rating: 4.5, reviewCount: 167, tags: [] },
  { id: 'p16', categoryId: 'cat5', name: 'Blueberry Cheesecake', slug: 'blueberry-cheesecake', description: 'Creamy New York-style cheesecake with blueberry compote.', price: 165, imageUrl: 'https://images.unsplash.com/photo-1533134242443-485ea6528edc?w=400&h=400&fit=crop', calories: 420, rating: 4.9, reviewCount: 378, isFeatured: true, tags: ['bestseller'] },
  { id: 'p17', categoryId: 'cat5', name: 'Tiramisu', slug: 'tiramisu', description: 'Classic Italian dessert with espresso-soaked ladyfingers.', price: 155, imageUrl: 'https://images.unsplash.com/photo-1571877227209-a0c98ea677e0?w=400&h=400&fit=crop', calories: 380, rating: 4.8, reviewCount: 245, tags: [] },
  { id: 'p18', categoryId: 'cat5', name: 'Chocolate Lava Cake', slug: 'chocolate-lava-cake', description: 'Warm molten chocolate center with vanilla ice cream.', price: 175, imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=400&fit=crop', calories: 450, rating: 4.7, reviewCount: 289, isSeasonal: true, tags: ['seasonal'] },
  { id: 'p19', categoryId: 'cat6', name: 'Club Sandwich', slug: 'club-sandwich', description: 'Triple-decker with chicken, bacon, lettuce, and tomato.', price: 195, imageUrl: 'https://images.unsplash.com/photo-1528735602785-4625d2634f62?w=400&h=400&fit=crop', calories: 520, rating: 4.5, reviewCount: 134, tags: [] },
  { id: 'p20', categoryId: 'cat6', name: 'Grilled Cheese Panini', slug: 'grilled-cheese-panini', description: 'Three-cheese blend on artisan sourdough.', price: 175, imageUrl: 'https://images.unsplash.com/photo-1528735602785-4625d2634f62?w=400&h=400&fit=crop', calories: 480, rating: 4.6, reviewCount: 198, tags: [] },
  { id: 'p21', categoryId: 'cat6', name: 'Tuna Melt', slug: 'tuna-melt', description: 'Premium tuna salad with melted cheddar on ciabatta.', price: 185, imageUrl: 'https://images.unsplash.com/photo-1553909489-dfc9c061a704?w=400&h=400&fit=crop', calories: 440, rating: 4.4, reviewCount: 112, tags: [] },
];

const addOns = [
  { id: 'a1', name: 'Extra Espresso Shot', price: 35, category: 'extra' },
  { id: 'a2', name: 'Oat Milk Upgrade', price: 25, category: 'milk' },
  { id: 'a3', name: 'Almond Milk Upgrade', price: 25, category: 'milk' },
  { id: 'a4', name: 'Whipped Cream', price: 20, category: 'extra' },
  { id: 'a5', name: 'Caramel Drizzle', price: 15, category: 'syrup' },
  { id: 'a6', name: 'Vanilla Syrup', price: 15, category: 'syrup' },
  { id: 'a7', name: 'Extra Ice', price: 0, category: 'extra' },
  { id: 'a8', name: 'Sugar-Free Sweetener', price: 0, category: 'extra' },
];

const users = [
  { id: 'u1', email: 'customer@brewsync.com', passwordHash: hash, role: 'customer', firstName: 'Maria', lastName: 'Santos', avatarUrl: null },
  { id: 'u2', email: 'cashier@brewsync.com', passwordHash: hash, role: 'cashier', firstName: 'Juan', lastName: 'Reyes', avatarUrl: null },
  { id: 'u3', email: 'manager@brewsync.com', passwordHash: hash, role: 'manager', firstName: 'Ana', lastName: 'Cruz', avatarUrl: null },
  { id: 'u4', email: 'admin@brewsync.com', passwordHash: hash, role: 'admin', firstName: 'Carlos', lastName: 'Mendoza', avatarUrl: null },
  { id: 'u5', email: 'demo@brewsync.com', passwordHash: hash, role: 'customer', firstName: 'Sophia', lastName: 'Lim', avatarUrl: null },
];

const customers = [
  { id: 'u1', loyaltyPoints: 2450, loyaltyTier: 'Gold', favoriteBranchId: 'b1', totalOrders: 47, totalSpent: 12450 },
  { id: 'u5', loyaltyPoints: 890, loyaltyTier: 'Silver', favoriteBranchId: 'b2', totalOrders: 18, totalSpent: 4320 },
];

const employees = [
  { id: 'u2', branchId: 'b1', employeeCode: 'EMP-001', position: 'Cashier' },
  { id: 'u3', branchId: 'b1', employeeCode: 'EMP-002', position: 'Branch Manager' },
  { id: 'u4', branchId: null, employeeCode: 'EMP-003', position: 'System Administrator' },
];

const orders = [
  { id: 'o1', orderNumber: 'BS-2024-001847', customerId: 'u1', branchId: 'b1', cashierId: 'u2', status: 'completed', subtotal: 330, tax: 39.6, total: 369.6, loyaltyPointsEarned: 37, createdAt: '2024-06-15T08:30:00Z' },
  { id: 'o2', orderNumber: 'BS-2024-001848', customerId: 'u1', branchId: 'b1', cashierId: 'u2', status: 'completed', subtotal: 260, tax: 31.2, total: 291.2, loyaltyPointsEarned: 29, createdAt: '2024-06-16T14:15:00Z' },
  { id: 'o3', orderNumber: 'BS-2024-001849', customerId: 'u5', branchId: 'b2', cashierId: 'u2', status: 'preparing', subtotal: 445, tax: 53.4, total: 498.4, loyaltyPointsEarned: 50, createdAt: new Date().toISOString() },
  { id: 'o4', orderNumber: 'BS-2024-001850', customerId: 'u1', branchId: 'b1', cashierId: 'u2', status: 'ready', subtotal: 195, tax: 23.4, total: 218.4, loyaltyPointsEarned: 22, createdAt: new Date(Date.now() - 600000).toISOString() },
];

const orderItems = [
  { id: 'oi1', orderId: 'o1', productId: 'p1', quantity: 1, unitPrice: 165, subtotal: 165, addOns: [{ id: 'a1', name: 'Extra Espresso Shot', price: 35 }] },
  { id: 'oi2', orderId: 'o1', productId: 'p13', quantity: 1, unitPrice: 95, subtotal: 95, addOns: [] },
  { id: 'oi3', orderId: 'o1', productId: 'p16', quantity: 1, unitPrice: 165, subtotal: 165, addOns: [] },
  { id: 'oi4', orderId: 'o2', productId: 'p3', quantity: 1, unitPrice: 175, subtotal: 175, addOns: [] },
  { id: 'oi5', orderId: 'o2', productId: 'p7', quantity: 1, unitPrice: 195, subtotal: 195, addOns: [{ id: 'a2', name: 'Oat Milk Upgrade', price: 25 }] },
  { id: 'oi6', orderId: 'o3', productId: 'p2', quantity: 2, unitPrice: 185, subtotal: 370, addOns: [] },
  { id: 'oi7', orderId: 'o3', productId: 'p13', quantity: 1, unitPrice: 95, subtotal: 95, addOns: [] },
  { id: 'oi8', orderId: 'o4', productId: 'p1', quantity: 1, unitPrice: 165, subtotal: 165, addOns: [{ id: 'a1', name: 'Extra Espresso Shot', price: 35 }] },
];

const promotions = [
  { id: 'pr1', title: 'Happy Hour Brew', description: '20% off all iced drinks 2-5 PM', discountPercent: 20, code: 'HAPPY20', bannerUrl: '/assets/banners/summer-brew.svg', startDate: '2024-01-01', endDate: '2024-12-31', isActive: true, branchId: null },
  { id: 'pr2', title: 'Weekend Pastry Bundle', description: 'Buy 2 pastries, get 1 free', discountPercent: 33, code: 'PASTRY3', bannerUrl: '/assets/banners/pastry-weekend.svg', startDate: '2024-06-01', endDate: '2024-08-31', isActive: true, branchId: null },
  { id: 'pr3', title: 'Holiday Special', description: 'Free upsize on any drink', discountAmount: 30, code: 'HOLIDAY24', bannerUrl: '/assets/banners/holiday.svg', startDate: '2024-06-01', endDate: '2024-07-31', isActive: true, branchId: 'b1' },
];

const mlModels = [
  { id: 'ml1', name: 'Product Recommender v2.1', algorithm: 'collaborative_filtering', version: '2.1.0', accuracy: 0.8723, isActive: true, trainedAt: '2024-06-01T00:00:00Z' },
  { id: 'ml2', name: 'Basket Analysis Engine', algorithm: 'association_rules', version: '1.4.0', accuracy: 0.8456, isActive: true, trainedAt: '2024-05-15T00:00:00Z' },
  { id: 'ml3', name: 'Purchase Predictor RF', algorithm: 'random_forest', version: '3.0.1', accuracy: 0.8912, isActive: true, trainedAt: '2024-06-10T00:00:00Z' },
  { id: 'ml4', name: 'XGBoost Ranker', algorithm: 'xgboost', version: '2.2.0', accuracy: 0.9034, isActive: true, trainedAt: '2024-06-12T00:00:00Z' },
];

const auditLogs = [
  { id: 'al1', userId: 'u4', action: 'USER_CREATED', entityType: 'user', entityId: 'u5', details: { email: 'demo@brewsync.com' }, createdAt: '2024-06-10T09:00:00Z' },
  { id: 'al2', userId: 'u4', action: 'PRODUCT_UPDATED', entityType: 'product', entityId: 'p1', details: { field: 'price', oldValue: 160, newValue: 165 }, createdAt: '2024-06-11T14:30:00Z' },
  { id: 'al3', userId: 'u3', action: 'PROMOTION_CREATED', entityType: 'promotion', entityId: 'pr3', details: { title: 'New Branch Opening - BGC' }, createdAt: '2024-06-12T11:00:00Z' },
  { id: 'al4', userId: 'u4', action: 'ML_MODEL_DEPLOYED', entityType: 'ml_model', entityId: 'ml4', details: { version: '2.2.0' }, createdAt: '2024-06-12T16:45:00Z' },
  { id: 'al5', userId: 'u2', action: 'ORDER_COMPLETED', entityType: 'order', entityId: 'o1', details: { total: 369.6 }, createdAt: '2024-06-15T08:35:00Z' },
];

function generateSalesAnalytics() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const salesTrend = days.map((day, i) => ({
    day,
    revenue: 45000 + Math.floor(Math.random() * 25000) + (i >= 4 ? 15000 : 0),
    orders: 180 + Math.floor(Math.random() * 80) + (i >= 4 ? 60 : 0),
  }));

  const productPopularity = products.slice(0, 8).map((p, i) => ({
    name: p.name,
    sales: 450 - i * 45 + Math.floor(Math.random() * 30),
    revenue: (450 - i * 45) * p.price,
  }));

  const branchComparison = branches.map((b, i) => ({
    branch: b.name.replace('BrewSync ', ''),
    revenue: 280000 - i * 35000 + Math.floor(Math.random() * 20000),
    orders: 1200 - i * 150,
    growth: 5 + Math.random() * 15,
  }));

  const revenueForecast = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() + i);
    return {
      month: month.toLocaleString('default', { month: 'short' }),
      actual: i === 0 ? 892000 : null,
      forecast: 850000 + i * 45000 + Math.floor(Math.random() * 30000),
    };
  });

  const peakHours = Array.from({ length: 14 }, (_, i) => ({
    hour: `${6 + i}:00`,
    orders: i >= 2 && i <= 4 ? 80 + Math.floor(Math.random() * 40) : i >= 10 && i <= 12 ? 60 + Math.floor(Math.random() * 30) : 20 + Math.floor(Math.random() * 25),
  }));

  return {
    dailySales: 42850,
    monthlyRevenue: 892000,
    totalCustomers: 12450,
    recommendationAcceptanceRate: 0.34,
    avgOrderValue: 285,
    salesTrend,
    productPopularity,
    branchComparison,
    revenueForecast,
    peakHours,
    customerGrowth: [
      { month: 'Jan', customers: 8200 },
      { month: 'Feb', customers: 8950 },
      { month: 'Mar', customers: 9400 },
      { month: 'Apr', customers: 10100 },
      { month: 'May', customers: 11200 },
      { month: 'Jun', customers: 12450 },
    ],
  };
}

function getRecommendations(customerId, contextProductId = null) {
  const customerOrders = orderItems.filter(oi => {
    const order = orders.find(o => o.id === oi.orderId);
    return order && order.customerId === customerId;
  });

  const purchasedIds = new Set(customerOrders.map(oi => oi.productId));
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 11;
  const isAfternoon = hour >= 14 && hour < 17;

  const rules = {
    p1: [{ productId: 'a1', type: 'addon', confidence: 0.92, algorithm: 'association_rules', reason: 'Customers who order Iced Latte often add Extra Espresso Shot' },
         { productId: 'p13', type: 'product', confidence: 0.78, algorithm: 'collaborative_filtering', reason: 'Frequently paired with pastries' },
         { productId: 'p16', type: 'product', confidence: 0.71, algorithm: 'xgboost', reason: 'Popular afternoon pairing' }],
    p3: [{ productId: 'p13', type: 'product', confidence: 0.85, algorithm: 'association_rules', reason: 'Spanish Latte + Croissant is a top combo' },
         { productId: 'p16', type: 'product', confidence: 0.68, algorithm: 'random_forest', reason: 'Sweet drink lovers prefer desserts' }],
    p7: [{ productId: 'p17', type: 'product', confidence: 0.74, algorithm: 'collaborative_filtering', reason: 'Matcha fans love Tiramisu' },
         { productId: 'a2', type: 'addon', confidence: 0.81, algorithm: 'association_rules', reason: 'Oat milk is the preferred upgrade' }],
  };

  let recs = [];
  if (contextProductId && rules[contextProductId]) {
    recs = rules[contextProductId];
  } else {
    recs = [
      { productId: 'p3', type: 'product', confidence: 0.89, algorithm: 'xgboost', reason: 'Based on your morning order patterns' },
      { productId: 'p13', type: 'product', confidence: 0.82, algorithm: 'collaborative_filtering', reason: 'Similar customers also enjoyed this' },
      { productId: 'p7', type: 'product', confidence: 0.76, algorithm: 'random_forest', reason: 'Trending in your area this week' },
      { productId: 'a1', type: 'addon', confidence: 0.91, algorithm: 'association_rules', reason: 'Perfect complement to your favorites' },
      { productId: 'p16', type: 'product', confidence: 0.73, algorithm: 'collaborative_filtering', reason: 'Seasonal favorite among Gold members' },
      { productId: 'p6', type: 'product', confidence: 0.68, algorithm: 'xgboost', reason: isAfternoon ? 'Perfect for afternoon refreshment' : 'Great cold brew option' },
    ];
  }

  return recs.map(r => {
    if (r.type === 'addon') {
      const addon = addOns.find(a => a.id === r.productId);
      return { ...r, item: addon, itemType: 'addon' };
    }
    const product = products.find(p => p.id === r.productId);
    const isRecommended = !purchasedIds.has(r.productId);
    return { ...r, item: product, itemType: 'product', isRecommended };
  }).filter(r => r.item);
}

module.exports = {
  branches, categories, products, addOns, users, customers, employees,
  orders, orderItems, promotions, mlModels, auditLogs,
  generateSalesAnalytics, getRecommendations,
};
