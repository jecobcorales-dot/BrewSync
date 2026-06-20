const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let dbConnected = false;

async function connectDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠ DATABASE_URL not set — using in-memory mock data');
    return false;
  }
  try {
    await prisma.$connect();
    dbConnected = true;
    console.log('✓ PostgreSQL connected via Prisma');
    return true;
  } catch (err) {
    console.warn('⚠ Database connection failed — falling back to mock data:', err.message);
    return false;
  }
}

function isDbConnected() {
  return dbConnected;
}

module.exports = { prisma, connectDatabase, isDbConnected };
