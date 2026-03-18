const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');

// ── MIDDLEWARE: verify admin password ──
const adminAuth = (req, res, next) => {
  const password = req.headers['admin-password'];
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// ── OVERVIEW STATS ──
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product');

    const totalOrders   = orders.length;
    const totalRevenue  = orders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

    res.json({ totalOrders, totalRevenue, pendingOrders, avgOrderValue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── SALES BY CATEGORY ──
router.get('/by-category', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product');

    const categoryStats = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.product?.category || 'unknown';
        if (!categoryStats[category]) {
          categoryStats[category] = { revenue: 0, quantity: 0, orders: 0 };
        }
        categoryStats[category].revenue  += (item.price || 0) * item.quantity;
        categoryStats[category].quantity += item.quantity;
        categoryStats[category].orders   += 1;
      });
    });

    res.json(categoryStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── MOST ORDERED PRODUCTS ──
router.get('/top-products', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product');

    const productStats = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const id   = item.product?._id?.toString() || item.name;
        const name = item.product?.name || item.name || 'Unknown';
        const cat  = item.product?.category || '';

        if (!productStats[id]) {
          productStats[id] = { name, category: cat, quantity: 0, revenue: 0 };
        }
        productStats[id].quantity += item.quantity;
        productStats[id].revenue  += (item.price || 0) * item.quantity;
      });
    });

    const sorted = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ALL ORDERS ──
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── UPDATE ORDER STATUS ──
router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;