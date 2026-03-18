const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateQuantity, removeFromCart } = require('../controllers/cartController');

router.get('/:userId', getCart);
router.post('/add', addToCart);
router.put('/update', updateQuantity);
router.delete('/remove/:itemId', removeFromCart);

module.exports = router;