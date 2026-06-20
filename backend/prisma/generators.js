const bcrypt = require('bcryptjs');

const CITIES = [
  { city: 'Taguig', area: 'BGC' }, { city: 'Makati', area: 'Ayala' },
  { city: 'Quezon City', area: 'Eastwood' }, { city: 'Cebu', area: 'IT Park' },
  { city: 'Pasig', area: 'Ortigas' }, { city: 'Manila', area: 'Binondo' },
  { city: 'Davao', area: 'Lanang' }, { city: 'Iloilo', area: 'Megaworld' },
  { city: 'Baguio', area: 'Session Road' }, { city: 'Clark', area: 'Pampanga' },
  { city: 'Bacolod', area: 'Lacson' }, { city: 'Cagayan de Oro', area: 'Downtown' },
  { city: 'Paranaque', area: 'BF Homes' }, { city: 'Mandaluyong', area: 'Shaw' },
  { city: 'San Juan', area: 'Greenhills' }, { city: 'Alabang', area: 'Muntinlupa' },
  { city: 'Tagaytay', area: 'Highlands' }, { city: 'Pampanga', area: 'Angeles' },
  { city: 'Laguna', area: 'Santa Rosa' }, { city: 'Cavite', area: 'Daang Hari' },
  { city: 'Batangas', area: 'Lipa' }, { city: 'Palawan', area: 'Puerto Princesa' },
  { city: 'Boracay', area: 'Station 2' }, { city: 'Subic', area: 'Freeport' },
  { city: 'Tacloban', area: 'Downtown' },
];

const FIRST_NAMES = ['Maria', 'Juan', 'Ana', 'Carlos', 'Sophia', 'Miguel', 'Isabella', 'Gabriel', 'Elena', 'Rafael', 'Camila', 'Diego', 'Lucia', 'Antonio', 'Valentina', 'Mateo', 'Sofia', 'Luis', 'Carmen', 'Jose'];
const LAST_NAMES = ['Santos', 'Reyes', 'Cruz', 'Mendoza', 'Lim', 'Garcia', 'Torres', 'Ramos', 'Flores', 'Aquino', 'Bautista', 'Castillo', 'Diaz', 'Gonzales', 'Hernandez', 'Lopez', 'Martinez', 'Morales', 'Navarro', 'Rivera'];

const COFFEE_NAMES = ['Iced Latte', 'Hot Latte', 'Caramel Macchiato', 'Spanish Latte', 'Americano', 'Flat White', 'Cold Brew', 'Cappuccino', 'Mocha', 'Affogato', 'Espresso', 'Cortado', 'Irish Coffee', 'Vietnamese Coffee', 'Honey Lavender Latte', 'Brown Sugar Latte', 'Salted Caramel Latte', 'Vanilla Latte', 'Hazelnut Latte', 'Pumpkin Spice Latte'];
const NON_COFFEE = ['Matcha Latte', 'Dark Chocolate', 'Strawberry Smoothie', 'Mango Shake', 'Chai Latte', 'Golden Milk', 'Hot Chocolate', 'Fresh Orange Juice', 'Berry Blast', 'Avocado Shake'];
const TEA = ['Earl Grey', 'Chamomile Honey', 'Iced Peach Tea', 'Green Tea', 'Jasmine Tea', 'Thai Milk Tea', 'Lemon Ginger Tea', 'Hibiscus Tea', 'Oolong Tea', 'Mint Tea'];
const PASTRY = ['Butter Croissant', 'Pain au Chocolat', 'Almond Danish', 'Cinnamon Roll', 'Blueberry Muffin', 'Banana Bread', 'Scone', 'Brioche', 'Apple Turnover', 'Cheese Danish'];
const DESSERT = ['Blueberry Cheesecake', 'Tiramisu', 'Chocolate Lava Cake', 'Red Velvet Cake', 'Mango Float', 'Ube Halaya', 'Biscoff Cheesecake', 'Matcha Cake', 'Carrot Cake', 'Brownie'];
const SANDWICH = ['Club Sandwich', 'Grilled Cheese Panini', 'Tuna Melt', 'Chicken Pesto', 'BLT Sandwich', 'Ham & Cheese', 'Egg Sandwich', 'Turkey Club', 'Caprese Panini', 'Philly Cheesesteak'];

const IMAGE_SETS = {
  coffee: 'photo-1509042239860-f550ce710b93',
  'non-coffee': 'photo-1515823064-d89553993c66',
  tea: 'photo-1564890369478-c89ca6d9cde9',
  pastries: 'photo-1555507036-eaa9352d9f0d',
  desserts: 'photo-1533134242443-485ea6528edc',
  sandwiches: 'photo-1528735602785-4625d2634f62',
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBranches(count = 25) {
  return CITIES.slice(0, count).map((loc, i) => ({
    name: `BrewSync ${loc.area}`,
    code: `BS-${String(i + 1).padStart(3, '0')}`,
    address: `${loc.area}, ${loc.city}`,
    city: loc.city,
    phone: `+63 2 8888 ${1000 + i}`,
    logoUrl: `/assets/branches/branch-${(i % 5) + 1}.svg`,
    isActive: true,
  }));
}

function generateProducts() {
  const categories = [
    { name: 'Coffee', slug: 'coffee', icon: 'coffee', names: COFFEE_NAMES },
    { name: 'Non-Coffee', slug: 'non-coffee', icon: 'glass-water', names: NON_COFFEE },
    { name: 'Tea', slug: 'tea', icon: 'leaf', names: TEA },
    { name: 'Pastries', slug: 'pastries', icon: 'croissant', names: PASTRY },
    { name: 'Desserts', slug: 'desserts', icon: 'cake', names: DESSERT },
    { name: 'Sandwiches', slug: 'sandwiches', icon: 'sandwich', names: SANDWICH },
  ];

  const products = [];
  let idx = 0;

  categories.forEach((cat, catIdx) => {
    const baseNames = [...cat.names];
    while (baseNames.length < 34) {
      baseNames.push(`${randomFrom(cat.names)} ${['Special', 'Deluxe', 'Premium', 'Classic'][idx % 4]}`);
      idx++;
    }
    baseNames.slice(0, 34).forEach((name, i) => {
      const slug = slugify(`${name}-${cat.slug}-${i}`);
      const isDrink = ['coffee', 'non-coffee', 'tea'].includes(cat.slug);
      products.push({
        categorySlug: cat.slug,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categorySort: catIdx + 1,
        name,
        slug,
        description: `Handcrafted ${name.toLowerCase()} made with premium ingredients. A BrewSync signature.`,
        price: isDrink ? 120 + Math.floor(Math.random() * 100) : 85 + Math.floor(Math.random() * 120),
        imageUrl: `https://images.unsplash.com/${IMAGE_SETS[cat.slug] || IMAGE_SETS.coffee}?w=600&h=600&fit=crop&auto=format&sig=${i + catIdx * 34}`,
        calories: isDrink ? 5 + Math.floor(Math.random() * 300) : 200 + Math.floor(Math.random() * 350),
        rating: 4 + Math.random() * 0.9,
        reviewCount: 50 + Math.floor(Math.random() * 500),
        isFeatured: Math.random() > 0.85,
        isSeasonal: Math.random() > 0.92,
        tags: Math.random() > 0.7 ? ['bestseller'] : [],
      });
    });
  });

  return products.slice(0, 200);
}

function generateCustomerBatch(batchIndex, batchSize, branchIds, passwordHash) {
  const customers = [];
  for (let i = 0; i < batchSize; i++) {
    const n = batchIndex * batchSize + i;
    const firstName = FIRST_NAMES[n % FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor(n / FIRST_NAMES.length) % LAST_NAMES.length];
    const email = `customer${n}@brewsync.demo`;
    customers.push({
      email,
      passwordHash,
      role: 'customer',
      firstName,
      lastName,
      loyaltyPoints: Math.floor(Math.random() * 5000),
      loyaltyTier: ['Bronze', 'Silver', 'Gold', 'Platinum'][Math.floor(Math.random() * 4)],
      favoriteBranchId: randomFrom(branchIds),
      totalOrders: 0,
      totalSpent: 0,
    });
  }
  return customers;
}

function generateOrdersBatch(batchIndex, batchSize, customerIds, productIds, branchIds, productPrices) {
  const orders = [];
  const statuses = ['completed', 'completed', 'completed', 'completed', 'preparing', 'ready', 'pending', 'cancelled'];
  for (let i = 0; i < batchSize; i++) {
    const n = batchIndex * batchSize + i;
    const itemCount = 1 + Math.floor(Math.random() * 3);
    let subtotal = 0;
    const items = [];
    for (let j = 0; j < itemCount; j++) {
      const pid = randomFrom(productIds);
      const qty = 1 + Math.floor(Math.random() * 2);
      const price = productPrices[pid] || 150;
      subtotal += price * qty;
      items.push({ productId: pid, quantity: qty, unitPrice: price, subtotal: price * qty });
    }
    const tax = subtotal * 0.12;
    const total = subtotal + tax;
    const daysAgo = Math.floor(Math.random() * 365);
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000);
    orders.push({
      orderNumber: `BS-${String(1000000 + n).padStart(7, '0')}`,
      customerId: randomFrom(customerIds),
      branchId: randomFrom(branchIds),
      status: randomFrom(statuses),
      subtotal,
      tax,
      total,
      loyaltyPointsEarned: Math.floor(total / 10),
      createdAt,
      items,
    });
  }
  return orders;
}

module.exports = {
  generateBranches,
  generateProducts,
  generateCustomerBatch,
  generateOrdersBatch,
  bcrypt,
};
