const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  discount:    { type: Number, default: 0 },        // discount percentage e.g. 20 = 20% off
  finalPrice:  { type: Number },                     // calculated after discount
  category:    { type: String, enum: ['perfumes', 'bodysplash', 'naturaloils'], required: true },
  image:       { type: String },
  size:        { type: String },
  gender:      { type: String, enum: ['men', 'women', 'unisex'] },
  scents:      [{ type: String }],
  description: { type: String },
  volume:      { type: String },
  purpose:     { type: String },
  inStock:     { type: Boolean, default: true },
}, { timestamps: true });

// Auto calculate final price before saving
productSchema.pre('save', function(next) {
  if (this.discount > 0) {
    this.finalPrice = Math.round(this.price - (this.price * this.discount / 100));
  } else {
    this.finalPrice = this.price;
  }
});

module.exports = mongoose.model('Product', productSchema);