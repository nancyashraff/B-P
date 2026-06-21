const Order = require('../models/Order');
const Cart  = require('../models/Cart');

const createOrder = async (req, res) => {
  try {
    const { userId, address } = req.body;
    const cart = await Cart.findOne({ userId }).populate('items.product');

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: 'Cart is empty' });

    const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    // Shipping will be decided later; use subtotal as total
    const total = subtotal;

    const order = await Order.create({
      userId,
      items: cart.items.map(i => ({
        product:  i.product._id,
        quantity: i.quantity,
        scent:    i.scent
      })),
      total,
      address
    });

    // Clear cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById };