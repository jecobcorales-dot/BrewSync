const { Server } = require('socket.io');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join:branch', (branchId) => {
      socket.join(`branch:${branchId}`);
    });

    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('join:cashier', () => {
      socket.join('cashier:queue');
    });

    socket.on('disconnect', () => {});
  });

  console.log('✓ Socket.IO initialized');
  return io;
}

function emitOrderCreated(order) {
  io?.to(`branch:${order.branchId}`).emit('order:created', order);
  io?.to('cashier:queue').emit('order:created', order);
  if (order.customerId) io?.to(`customer:${order.customerId}`).emit('order:created', order);
}

function emitOrderUpdated(order) {
  io?.to(`order:${order.id}`).emit('order:updated', order);
  io?.to(`branch:${order.branchId}`).emit('order:updated', order);
  io?.to('cashier:queue').emit('order:updated', order);
  if (order.customerId) io?.to(`customer:${order.customerId}`).emit('order:updated', order);
}

function getIO() {
  return io;
}

module.exports = { initSocket, emitOrderCreated, emitOrderUpdated, getIO };
