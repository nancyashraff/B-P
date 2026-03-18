const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  email:  { type: String, required: true },
  phone:  { type: String, required: true },
  items: [
    {
      product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number },
      scent:    { type: String, default: '' },
      name:     { type: String },
      price:    { type: Number },
      category: { type: String, default: '' },
      image:    { type: String, default: '' },
    }
  ],
  total:  { type: Number, required: true },
  address: {
    governorate: { type: String },
    street:      { type: String },
    building:    { type: String },
    apartment:   { type: String },
  },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered'], default: 'pending' },
  trackingNumber: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);