const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  password: { type: String, required: true }
}, { bufferCommands: false });

module.exports = mongoose.model('Admin', adminSchema);