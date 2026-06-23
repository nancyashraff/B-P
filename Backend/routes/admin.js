const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Product = require('../models/Product');
const upload  = require('../utils/upload');
const path    = require('path');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
  const password = req.headers['admin-password'];
  
  try {
    // Look for a changed password in the database
    const adminRecord = await Admin.findOne();
    const correctPassword = adminRecord ? adminRecord.password : process.env.ADMIN_PASSWORD;

    if (password !== correctPassword) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Database auth error' });
  }
};

router.post('/upload', adminAuth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message);
      return res.status(500).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('File uploaded:', req.file.filename);

    // Note: Local fs copies are skipped here because Vercel environments use cloud storage 
    // and a read-only root system. Ensure frontend fetches images via your dynamic /uploads static route.
    res.json({ filename: req.file.filename });
  });
});

// ── STATS ──
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find();
    const totalOrders   = orders.length;
    const totalRevenue  = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
    res.json({ totalOrders, totalRevenue, avgOrderValue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── SALES BY CATEGORY ──
router.get('/by-category', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find();
    const categoryStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.category || 'unknown';
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

// ── TOP PRODUCTS ──
router.get('/top-products', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find();
    const productStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const id = item.name;
        if (!productStats[id]) {
          productStats[id] = { name: item.name, category: item.category, quantity: 0, revenue: 0 };
        }
        productStats[id].quantity += item.quantity;
        productStats[id].revenue  += (item.price || 0) * item.quantity;
      });
    });
    const sorted = Object.values(productStats).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ALL ORDERS ──
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/password', adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required.' });
    }

    const adminRecord = await Admin.findOne();
    const correctPassword = adminRecord ? adminRecord.password : process.env.ADMIN_PASSWORD;

    if (currentPassword !== correctPassword) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ message: 'New password must be at least 4 characters long.' });
    }

    // Save the new password securely in your database collection
    if (adminRecord) {
      adminRecord.password = newPassword;
      await adminRecord.save();
    } else {
      await Admin.create({ password: newPassword });
    }

    res.json({ message: 'Password updated successfully across all servers!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET ALL PRODUCTS ──
router.get('/products', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ category: 1, price: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADD PRODUCT ──
router.post('/products', adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── EDIT PRODUCT ──
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    Object.assign(product, req.body);
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE PRODUCT ──
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── TOGGLE STOCK ──
router.put('/products/:id/stock', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.inStock = !product.inStock;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── RESET DATABASE ──
router.delete('/reset-database', adminAuth, async (req, res) => {
  try {
    const OTP     = require('../models/OTP');
    const Order   = require('../models/Order');

    await Product.deleteMany({});
    await Order.deleteMany({});
    await OTP.deleteMany({});

    res.json({ message: 'Database cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;