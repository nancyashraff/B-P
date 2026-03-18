const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  category:    { type: String, enum: ['perfumes', 'bodysplash', 'naturaloils'], required: true },
  image:       { type: String },

  // Perfumes only
  size:        { type: String },
  gender:      { type: String, enum: ['men', 'women', 'unisex'] },
  scents:      [{ type: String }],

  // Body Splash only
  description: { type: String },

  // Natural Oils only
  volume:      { type: String },
  purpose:     { type: String },

  inStock:     { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);