const { prisma, isDbConnected } = require('../lib/prisma');
const mock = require('../data/mockData');

function decimal(n) {
  return typeof n === 'object' && n !== null ? Number(n) : n;
}

function mapProduct(p) {
  if (!p) return null;
  return {
    id: p.id,
    categoryId: p.categoryId,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: decimal(p.price),
    imageUrl: p.imageUrl,
    calories: p.calories,
    rating: decimal(p.rating),
    reviewCount: p.reviewCount,
    isAvailable: p.isAvailable,
    isSeasonal: p.isSeasonal,
    isFeatured: p.isFeatured,
    tags: p.tags,
    category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : undefined,
  };
}

function mapOrder(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    branchId: order.branchId,
    cashierId: order.cashierId,
    status: order.status,
    subtotal: decimal(order.subtotal),
    tax: decimal(order.tax),
    total: decimal(order.total),
    loyaltyPointsEarned: order.loyaltyPointsEarned,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items?.map(i => ({
      id: i.id,
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: decimal(i.unitPrice),
      subtotal: decimal(i.subtotal),
      addOns: i.addOns,
      product: mapProduct(i.product),
    })),
    branch: order.branch ? { id: order.branch.id, name: order.branch.name, address: order.branch.address, city: order.branch.city } : undefined,
  };
}

const orderInclude = {
  items: { include: { product: { include: { category: true } } } },
  branch: true,
};

const DataService = {
  async getCategories() {
    if (!isDbConnected()) return mock.categories;
    return prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  },

  async getProducts(filters = {}) {
    if (!isDbConnected()) {
      let result = mock.products.filter(p => p.isAvailable !== false);
      if (filters.category) {
        const cat = mock.categories.find(c => c.slug === filters.category || c.id === filters.category);
        if (cat) result = result.filter(p => p.categoryId === cat.id);
      }
      if (filters.featured) result = result.filter(p => p.isFeatured);
      return result.map(p => ({ ...p, category: mock.categories.find(c => c.id === p.categoryId) }));
    }
    const where = { isAvailable: true };
    if (filters.category) {
      where.category = { OR: [{ slug: filters.category }, { id: filters.category }] };
    }
    if (filters.featured) where.isFeatured = true;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const products = await prisma.product.findMany({ where, include: { category: true }, orderBy: { name: 'asc' } });
    return products.map(mapProduct);
  },

  async getProduct(id) {
    if (!isDbConnected()) {
      const p = mock.products.find(x => x.id === id || x.slug === id);
      return p ? { ...p, category: mock.categories.find(c => c.id === p.categoryId), availableAddOns: mock.addOns } : null;
    }
    const p = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { category: true },
    });
    if (!p) return null;
    const addOns = await prisma.addOn.findMany({ where: { isAvailable: true } });
    return { ...mapProduct(p), availableAddOns: addOns.map(a => ({ ...a, price: decimal(a.price) })) };
  },

  async getAddOns() {
    if (!isDbConnected()) return mock.addOns;
    const addOns = await prisma.addOn.findMany({ where: { isAvailable: true } });
    return addOns.map(a => ({ ...a, price: decimal(a.price) }));
  },

  async findUserByEmail(email) {
    if (!isDbConnected()) return mock.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { customer: true, employee: true } });
  },

  async createUser(data) {
    if (!isDbConnected()) {
      mock.users.push(data);
      if (data.role === 'customer') mock.customers.push({ id: data.id, loyaltyPoints: 100, loyaltyTier: 'Bronze', favoriteBranchId: 'b1', totalOrders: 0, totalSpent: 0 });
      return data;
    }
    const user = await prisma.user.create({
      data: { email: data.email, passwordHash: data.passwordHash, role: data.role, firstName: data.firstName, lastName: data.lastName },
    });
    if (data.role === 'customer') {
      const branch = await prisma.branch.findFirst();
      await prisma.customer.create({ data: { id: user.id, favoriteBranchId: branch?.id } });
    }
    return user;
  },

  async getOrders(user) {
    if (!isDbConnected()) {
      let result = [...mock.orders];
      if (user.role === 'customer') result = result.filter(o => o.customerId === user.id);
      return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(o => {
        const items = mock.orderItems.filter(i => i.orderId === o.id).map(i => ({ ...i, product: mock.products.find(p => p.id === i.productId) }));
        return { ...o, items, branch: mock.branches.find(b => b.id === o.branchId) };
      });
    }
    const where = user.role === 'customer' ? { customerId: user.id } : {};
    const orders = await prisma.order.findMany({ where, include: orderInclude, orderBy: { createdAt: 'desc' }, take: user.role === 'customer' ? 50 : 100 });
    return orders.map(mapOrder);
  },

  async getOrderQueue() {
    if (!isDbConnected()) {
      return mock.orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).map(o => {
        const items = mock.orderItems.filter(i => i.orderId === o.id).map(i => ({ ...i, product: mock.products.find(p => p.id === i.productId) }));
        return { ...o, items, branch: mock.branches.find(b => b.id === o.branchId) };
      });
    }
    const orders = await prisma.order.findMany({
      where: { status: { in: ['pending', 'preparing', 'ready'] } },
      include: orderInclude,
      orderBy: { createdAt: 'asc' },
    });
    return orders.map(mapOrder);
  },

  async getOrder(id) {
    if (!isDbConnected()) {
      const o = mock.orders.find(x => x.id === id || x.orderNumber === id);
      if (!o) return null;
      const items = mock.orderItems.filter(i => i.orderId === o.id).map(i => ({ ...i, product: mock.products.find(p => p.id === i.productId) }));
      return { ...o, items, branch: mock.branches.find(b => b.id === o.branchId) };
    }
    const o = await prisma.order.findFirst({ where: { OR: [{ id }, { orderNumber: id }] }, include: orderInclude });
    return o ? mapOrder(o) : null;
  },

  async createOrder({ items, branchId, customerId, cashierId, notes, paymentMethod }) {
    if (!isDbConnected()) {
      const subtotal = items.reduce((sum, item) => {
        const product = mock.products.find(p => p.id === item.productId);
        const addOnTotal = (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
        return sum + ((product?.price || 0) + addOnTotal) * (item.quantity || 1);
      }, 0);
      const tax = subtotal * 0.12;
      const order = {
        id: require('uuid').v4(),
        orderNumber: `BS-${String(mock.orders.length + 1000000).padStart(7, '0')}`,
        customerId, branchId: branchId || 'b1', cashierId,
        status: 'pending', subtotal, tax, total: subtotal + tax,
        loyaltyPointsEarned: Math.floor((subtotal + tax) / 10), notes,
        createdAt: new Date().toISOString(),
      };
      mock.orders.unshift(order);
      items.forEach(item => {
        const product = mock.products.find(p => p.id === item.productId);
        mock.orderItems.push({
          id: require('uuid').v4(), orderId: order.id, productId: item.productId,
          quantity: item.quantity || 1, unitPrice: product?.price || 0,
          subtotal: (product?.price || 0) * (item.quantity || 1), addOns: item.addOns || [],
        });
      });
      return DataService.getOrder(order.id);
    }

    let subtotal = 0;
    const lineItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      const addOnTotal = (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
      const unitPrice = Number(product.price) + addOnTotal;
      const qty = item.quantity || 1;
      subtotal += unitPrice * qty;
      lineItems.push({ productId: item.productId, quantity: qty, unitPrice, subtotal: unitPrice * qty, addOns: item.addOns || [] });
    }
    const tax = subtotal * 0.12;
    const total = subtotal + tax;
    const count = await prisma.order.count();
    const order = await prisma.order.create({
      data: {
        orderNumber: `BS-${String(1000000 + count).padStart(7, '0')}`,
        customerId, branchId, cashierId,
        status: 'pending', subtotal, tax, total,
        loyaltyPointsEarned: Math.floor(total / 10), notes,
        items: { create: lineItems },
      },
      include: orderInclude,
    });
    await prisma.transaction.create({ data: { orderId: order.id, amount: total, paymentMethod: paymentMethod || 'card' } });
    if (customerId) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { totalOrders: { increment: 1 }, totalSpent: { increment: total }, loyaltyPoints: { increment: order.loyaltyPointsEarned } },
      });
    }
    return mapOrder(order);
  },

  async updateOrderStatus(id, status) {
    if (!isDbConnected()) {
      const o = mock.orders.find(x => x.id === id);
      if (o) { o.status = status; o.updatedAt = new Date().toISOString(); }
      return DataService.getOrder(id);
    }
    const order = await prisma.order.update({ where: { id }, data: { status }, include: orderInclude });
    return mapOrder(order);
  },

  async getBranches() {
    if (!isDbConnected()) return mock.branches;
    return prisma.branch.findMany({ orderBy: { name: 'asc' } });
  },

  async getUsers() {
    if (!isDbConnected()) return mock.users.map(u => ({ id: u.id, email: u.email, role: u.role, firstName: u.firstName, lastName: u.lastName, isActive: true }));
    return prisma.user.findMany({ select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true, createdAt: true } });
  },

  async getPromotions() {
    if (!isDbConnected()) return mock.promotions;
    return prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async getMLModels() {
    if (!isDbConnected()) return mock.mlModels;
    return prisma.mLModel.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async getAuditLogs() {
    if (!isDbConnected()) {
      return mock.auditLogs.map(l => ({ ...l, user: mock.users.find(u => u.id === l.userId) }));
    }
    return prisma.auditLog.findMany({ include: { user: { select: { firstName: true, lastName: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  },

  async getAnalytics() {
    if (!isDbConnected()) return mock.generateSalesAnalytics();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const [dailyAgg, monthlyAgg, customerCount, orderCount, topProducts] = await Promise.all([
      prisma.order.aggregate({ where: { createdAt: { gte: today }, status: 'completed' }, _sum: { total: true }, _count: true }),
      prisma.order.aggregate({ where: { createdAt: { gte: monthStart }, status: 'completed' }, _sum: { total: true } }),
      prisma.customer.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 8 }),
    ]);
    const productDetails = await prisma.product.findMany({ where: { id: { in: topProducts.map(p => p.productId) } } });
    const base = mock.generateSalesAnalytics();
    return {
      ...base,
      dailySales: Number(dailyAgg._sum.total || 0) || base.dailySales,
      monthlyRevenue: Number(monthlyAgg._sum.total || 0) || base.monthlyRevenue,
      totalCustomers: customerCount || base.totalCustomers,
      productPopularity: topProducts.map(tp => {
        const p = productDetails.find(x => x.id === tp.productId);
        return { name: p?.name || 'Unknown', sales: tp._sum.quantity, revenue: Number(p?.price || 0) * tp._sum.quantity };
      }),
    };
  },

  async getCashierStats() {
    if (!isDbConnected()) {
      const todayOrders = mock.orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
      return {
        todaySales: todayOrders.reduce((s, o) => s + o.total, 0),
        todayOrders: todayOrders.length,
        avgOrderValue: todayOrders.length ? todayOrders.reduce((s, o) => s + o.total, 0) / todayOrders.length : 0,
        pendingOrders: mock.orders.filter(o => ['pending', 'preparing'].includes(o.status)).length,
        readyOrders: mock.orders.filter(o => o.status === 'ready').length,
      };
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [agg, pending, ready] = await Promise.all([
      prisma.order.aggregate({ where: { createdAt: { gte: today } }, _sum: { total: true }, _count: true, _avg: { total: true } }),
      prisma.order.count({ where: { status: { in: ['pending', 'preparing'] } } }),
      prisma.order.count({ where: { status: 'ready' } }),
    ]);
    return {
      todaySales: Number(agg._sum.total || 0),
      todayOrders: agg._count,
      avgOrderValue: Number(agg._avg.total || 0),
      pendingOrders: pending,
      readyOrders: ready,
    };
  },

  async searchCustomers(query) {
    if (!isDbConnected()) {
      return mock.customers.slice(0, 10).map(c => {
        const u = mock.users.find(x => x.id === c.id);
        return { ...c, email: u?.email, firstName: u?.firstName, lastName: u?.lastName };
      });
    }
    const users = await prisma.user.findMany({
      where: {
        role: 'customer',
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { customer: true },
      take: 20,
    });
    return users.map(u => ({
      id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName,
      loyaltyPoints: u.customer?.loyaltyPoints, loyaltyTier: u.customer?.loyaltyTier,
      totalOrders: u.customer?.totalOrders, totalSpent: decimal(u.customer?.totalSpent),
    }));
  },

  async getCustomerProfile(userId) {
    if (!isDbConnected()) {
      const u = mock.users.find(x => x.id === userId);
      const c = mock.customers.find(x => x.id === userId);
      return u ? { ...u, ...c, passwordHash: undefined } : null;
    }
    const u = await prisma.user.findUnique({ where: { id: userId }, include: { customer: { include: { favoriteBranch: true } } } });
    if (!u) return null;
    return {
      id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, avatarUrl: u.avatarUrl,
      loyaltyPoints: u.customer?.loyaltyPoints, loyaltyTier: u.customer?.loyaltyTier,
      totalOrders: u.customer?.totalOrders, totalSpent: decimal(u.customer?.totalSpent),
      favoriteBranch: u.customer?.favoriteBranch,
    };
  },

  async createProduct(data) {
    if (!isDbConnected()) return null;
    return prisma.product.create({ data, include: { category: true } });
  },

  async updateProduct(id, data) {
    if (!isDbConnected()) return null;
    return prisma.product.update({ where: { id }, data, include: { category: true } });
  },

  async createPromotion(data) {
    if (!isDbConnected()) return null;
    return prisma.promotion.create({ data });
  },

  async updateUser(id, data) {
    if (!isDbConnected()) return null;
    return prisma.user.update({ where: { id }, data });
  },
};

module.exports = DataService;
