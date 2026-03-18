const Cart = require('../models/Cart');

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, scent } = req.body;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId, items: [{ product: productId, quantity, scent }] });
    } else {
      const existing = cart.items.find(i => 
        i.product.toString() === productId && i.scent === scent
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, scent });
      }
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;
    const cart = await Cart.findOne({ userId });
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCart, addToCart, updateQuantity, removeFromCart };