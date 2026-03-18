const OTP   = require('../models/OTP');
const Order = require('../models/Order');
const { sendOTP, sendOrderNotification } = require('../utils/mailer');
//const { createDelivery } = require('../utils/bosta');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const otp       = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });
    await sendOTP(email, otp);

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyOTPAndOrder = async (req, res) => {
  try {
    const { email, otp, phone, address, cartItems, total } = req.body;

    const record = await OTP.findOne({ email });
    if (!record) return res.status(400).json({ message: 'OTP not found, request a new one' });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired, request a new one' });
    if (record.otp !== otp) return res.status(400).json({ message: 'Incorrect OTP' });

    await OTP.deleteMany({ email });

    const mappedItems = cartItems.map(i => ({
      name: i.name || '',
      price: i.price || 0,
      quantity: i.quantity || 1,
      scent: i.scent || '',
      category: i.category || 'unknown',
      image: i.image || '',
    }));

    const order = await Order.create({
      email,
      phone,
      address,
      items: mappedItems,
      total,
    });
  //   try {
  //   const bostaOrder = await createDelivery({ ...order.toObject(), phone, address });
  //   // Save Bosta tracking number to order
  //   await Order.findByIdAndUpdate(order._id, { 
  //     trackingNumber: bostaOrder.trackingNumber 
  //   });
  //   } catch (err) {
  //     console.error('Bosta error:', err.message);
  //     // Don't block the order if Bosta fails
  // }
  // Send order details to your email
    await sendOrderNotification({ ...order.toObject(), email, phone, address });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { requestOTP, verifyOTPAndOrder };