const { prisma, isDbConnected } = require('./prisma');

async function logAudit({ userId, action, entityType, entityId, details = {}, ipAddress }) {
  if (!isDbConnected()) return;
  try {
    await prisma.auditLog.create({
      data: { userId, action, entityType, entityId, details, ipAddress },
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logAudit };
