const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const {
  generateBranches,
  generateProducts,
  generateCustomerBatch,
  generateOrdersBatch,
  bcrypt,
} = require('./generators');

const prisma = new PrismaClient();
const MODE = process.argv[2] || process.env.SEED_MODE || 'dev';
const isEnterprise = MODE === 'enterprise';

const ENTERPRISE = { branches: 25, products: 200, customers: 50000, orders: 500000, customerBatch: 1000, orderBatch: 5000 };
const DEV = { branches: 4, products: 21, customers: 5, orders: 20 };

async function clearAll() {
  await prisma.auditLog.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.salesReport.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.mLModel.deleteMany();
  await prisma.product.deleteMany();
  await prisma.addOn.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
}

async function seedCustomersBulk(target, branchIds, passwordHash, existingIds = []) {
  const customerIds = [...existingIds];
  const remaining = target - customerIds.length;
  const batchSize = isEnterprise ? ENTERPRISE.customerBatch : remaining;
  const batches = Math.ceil(remaining / batchSize);

  for (let b = 0; b < batches; b++) {
    const size = Math.min(batchSize, remaining - b * batchSize);
    const batch = generateCustomerBatch(b, size, branchIds, passwordHash);
    const users = batch.map(c => ({
      id: uuidv4(),
      email: c.email,
      passwordHash: c.passwordHash,
      role: 'customer',
      firstName: c.firstName,
      lastName: c.lastName,
    }));
    await prisma.user.createMany({ data: users });
    await prisma.customer.createMany({
      data: users.map((u, i) => ({
        id: u.id,
        loyaltyPoints: batch[i].loyaltyPoints,
        loyaltyTier: batch[i].loyaltyTier,
        favoriteBranchId: batch[i].favoriteBranchId,
      })),
    });
    customerIds.push(...users.map(u => u.id));
    if (isEnterprise) process.stdout.write(`\r  Customers: ${customerIds.length}/${target}`);
  }
  return customerIds;
}

async function seedOrdersBulk(target, customerIds, productIds, branchIds, productPrices) {
  const batchSize = isEnterprise ? ENTERPRISE.orderBatch : target;
  const batches = Math.ceil(target / batchSize);
  let totalCreated = 0;

  for (let b = 0; b < batches; b++) {
    const size = Math.min(batchSize, target - b * batchSize);
    const batch = generateOrdersBatch(b, size, customerIds, productIds, branchIds, productPrices);

    const orders = batch.map(o => ({
      id: uuidv4(),
      orderNumber: o.orderNumber,
      customerId: o.customerId,
      branchId: o.branchId,
      status: o.status,
      subtotal: o.subtotal,
      tax: o.tax,
      total: o.total,
      loyaltyPointsEarned: o.loyaltyPointsEarned,
      createdAt: o.createdAt,
    }));

    const orderItems = [];
    const transactions = [];
    batch.forEach((o, i) => {
      o.items.forEach(item => {
        orderItems.push({
          id: uuidv4(),
          orderId: orders[i].id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        });
      });
      if (o.status === 'completed') {
        transactions.push({
          id: uuidv4(),
          orderId: orders[i].id,
          amount: o.total,
          paymentMethod: ['card', 'gcash', 'cash'][Math.floor(Math.random() * 3)],
        });
      }
    });

    await prisma.order.createMany({ data: orders });
    await prisma.orderItem.createMany({ data: orderItems });
    if (transactions.length) await prisma.transaction.createMany({ data: transactions });

    totalCreated += size;
    if (isEnterprise) process.stdout.write(`\r  Orders: ${totalCreated}/${target}`);
  }
  return totalCreated;
}

async function main() {
  console.log(`\n☕ BrewSync Seed — ${isEnterprise ? 'ENTERPRISE' : 'DEV'} mode\n`);
  const passwordHash = bcrypt.hashSync('BrewSync2024!', 10);

  console.log('Clearing existing data...');
  await clearAll();

  const branchData = generateBranches(isEnterprise ? ENTERPRISE.branches : DEV.branches);
  await prisma.branch.createMany({ data: branchData });
  const branches = await prisma.branch.findMany();
  const branchIds = branches.map(b => b.id);
  console.log(`✓ ${branches.length} branches`);

  const productData = generateProducts();
  const categoryMap = {};
  for (const p of productData) {
    if (!categoryMap[p.categorySlug]) {
      categoryMap[p.categorySlug] = await prisma.category.create({
        data: { name: p.categoryName, slug: p.categorySlug, icon: p.categoryIcon, sortOrder: p.categorySort },
      });
    }
    await prisma.product.create({
      data: {
        categoryId: categoryMap[p.categorySlug].id,
        name: p.name, slug: p.slug, description: p.description, price: p.price,
        imageUrl: p.imageUrl, calories: p.calories,
        rating: Math.round(p.rating * 10) / 10, reviewCount: p.reviewCount,
        isFeatured: p.isFeatured, isSeasonal: p.isSeasonal, tags: p.tags,
      },
    });
  }
  const products = await prisma.product.findMany();
  const productIds = products.map(p => p.id);
  const productPrices = Object.fromEntries(products.map(p => [p.id, Number(p.price)]));
  console.log(`✓ ${products.length} products`);

  await prisma.addOn.createMany({
    data: [
      { name: 'Extra Espresso Shot', price: 35 }, { name: 'Oat Milk Upgrade', price: 25 },
      { name: 'Almond Milk Upgrade', price: 25 }, { name: 'Whipped Cream', price: 20 },
      { name: 'Caramel Drizzle', price: 15 }, { name: 'Vanilla Syrup', price: 15 },
    ],
  });

  const staffUsers = [
    { email: 'customer@brewsync.com', role: 'customer', firstName: 'Maria', lastName: 'Santos', loyaltyPoints: 2450, loyaltyTier: 'Gold' },
    { email: 'demo@brewsync.com', role: 'customer', firstName: 'Sophia', lastName: 'Lim', loyaltyPoints: 890, loyaltyTier: 'Silver' },
    { email: 'cashier@brewsync.com', role: 'cashier', firstName: 'Juan', lastName: 'Reyes', position: 'Cashier', employeeCode: 'EMP-001' },
    { email: 'manager@brewsync.com', role: 'manager', firstName: 'Ana', lastName: 'Cruz', position: 'Branch Manager', employeeCode: 'EMP-002' },
    { email: 'admin@brewsync.com', role: 'admin', firstName: 'Carlos', lastName: 'Mendoza', position: 'System Administrator', employeeCode: 'EMP-003' },
  ];

  const demoCustomerIds = [];
  for (const s of staffUsers) {
    const user = await prisma.user.create({
      data: { email: s.email, passwordHash, role: s.role, firstName: s.firstName, lastName: s.lastName },
    });
    if (s.role === 'customer') {
      await prisma.customer.create({
        data: { id: user.id, loyaltyPoints: s.loyaltyPoints || 100, loyaltyTier: s.loyaltyTier || 'Bronze', favoriteBranchId: branchIds[0] },
      });
      demoCustomerIds.push(user.id);
    } else {
      await prisma.employee.create({
        data: { id: user.id, branchId: branchIds[0], employeeCode: s.employeeCode, position: s.position },
      });
    }
  }
  console.log(`✓ ${staffUsers.length} staff/demo users`);

  const targetCustomers = isEnterprise ? ENTERPRISE.customers : DEV.customers;
  const customerIds = await seedCustomersBulk(targetCustomers, branchIds, passwordHash, demoCustomerIds);
  console.log(`\n✓ ${customerIds.length} customers`);

  const targetOrders = isEnterprise ? ENTERPRISE.orders : DEV.orders;
  const ordersCreated = await seedOrdersBulk(targetOrders, customerIds, productIds, branchIds, productPrices);
  console.log(`\n✓ ${ordersCreated} orders`);

  await prisma.promotion.createMany({
    data: [
      { title: 'Happy Hour Brew', description: '20% off iced drinks 2-5 PM', discountPercent: 20, code: 'HAPPY20', bannerUrl: '/assets/banners/summer-brew.svg', isActive: true },
      { title: 'Weekend Pastry Bundle', description: 'Buy 2 get 1 free', discountPercent: 33, code: 'PASTRY3', bannerUrl: '/assets/banners/pastry-weekend.svg', isActive: true },
      { title: 'Holiday Special', description: 'Free upsize', discountAmount: 30, code: 'HOLIDAY24', bannerUrl: '/assets/banners/holiday.svg', isActive: true },
    ],
  });

  await prisma.mLModel.createMany({
    data: [
      { name: 'Collaborative Filtering v2.1', algorithm: 'collaborative_filtering', version: '2.1.0', accuracy: 0.8723, isActive: true, trainedAt: new Date() },
      { name: 'Apriori Association Rules', algorithm: 'association_rules', version: '1.4.0', accuracy: 0.8456, isActive: true, trainedAt: new Date() },
      { name: 'Random Forest Predictor', algorithm: 'random_forest', version: '3.0.1', accuracy: 0.8912, isActive: true, trainedAt: new Date() },
      { name: 'XGBoost Ranker', algorithm: 'xgboost', version: '2.2.0', accuracy: 0.9034, isActive: true, trainedAt: new Date() },
    ],
  });

  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  await prisma.auditLog.create({
    data: { userId: admin.id, action: 'SEED_COMPLETED', entityType: 'system', details: { mode: MODE, customers: customerIds.length, orders: ordersCreated } },
  });

  console.log('\n✅ Seed completed successfully!\n');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
