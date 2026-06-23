const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/admin', require('./routes/admin'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// On startup, copy any images from Frontend/utils into Backend/uploads
try {
  const frontendUtils = path.join(__dirname, '../Frontend/utils');
  const backendUploads = path.join(__dirname, 'uploads');
  if (fs.existsSync(frontendUtils)) {
    if (!fs.existsSync(backendUploads)) fs.mkdirSync(backendUploads, { recursive: true });
    fs.readdirSync(frontendUtils).forEach(file => {
      const src = path.join(frontendUtils, file);
      const dest = path.join(backendUploads, file);
      if (!fs.existsSync(dest)) {
        try { fs.copyFileSync(src, dest); } catch (err) { console.warn('copy startup file failed', file, err.message); }
      }
    });
  }
} catch (err) {
  console.warn('Startup sync failed:', err.message);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch(err => console.error('Connection failed:', err));

  module.exports = app;