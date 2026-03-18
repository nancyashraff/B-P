const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { getAllProducts, getProductById, seedProducts } = require('../controllers/productsController');

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const query = q.toLowerCase().trim();

    const categoryMap = {
      'perfume':     'perfumes',
      'perfumes':    'perfumes',
      'عطر':         'perfumes',
      'splash':      'bodysplash',
      'body splash': 'bodysplash',
      'bodysplash':  'bodysplash',
      'oil':         'naturaloils',
      'oils':        'naturaloils',
      'natural':     'naturaloils',
      'naturaloils': 'naturaloils',
    };

    const mappedCategory = categoryMap[query];

    const orConditions = [
      { name:        { $regex: query, $options: 'i' } },
      { category:    { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { size:        { $regex: query, $options: 'i' } },
      { gender:      { $regex: query, $options: 'i' } },
      { scents:      { $elemMatch: { $regex: query, $options: 'i' } } },
    ];

    if (mappedCategory) {
      orConditions.push({ category: mappedCategory });
    }

    const products = await Product.find({ $or: orConditions }).limit(10);
    res.json(products);

  } catch (err) {
    console.error('Search error:', err); // this will show in terminal
    res.status(500).json({ message: err.message });
  }
});
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/seed', seedProducts); // run once to fill your DB

module.exports = router;