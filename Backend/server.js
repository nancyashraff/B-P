const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

// ── FIXED VERCEL STATIC PATHING ──
// Explictly resolve paths relative to the root directory so Vercel never loses them
const frontendPath = path.resolve(__dirname, '../Frontend');
app.use(express.static(frontendPath));

// Serve static uploads correctly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API ROUTES ──
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/admin', require('./routes/admin'));

// Fallback rule for HTML Pages
app.get('/:page.html', (req, res) => {
  res.sendFile(path.join(frontendPath, `${req.params.page}.html`));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── VERCEL SAFE STARTUP IMAGE SYNC ──
if (process.env.NODE_ENV !== 'production') {
  try {
    const frontendUtils = path.join(frontendPath, 'utils');
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
}

// ── GLOBAL DATABASE CONNECTION CACHE ──
let cachedConnection = global.mongoose;

if (!cachedConnection) {
  cachedConnection = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }

  if (!cachedConnection.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cachedConnection.promise = mongoose.connect(process.env.MONGO_URI, opts).then((m) => {
      console.log('MongoDB connected');
      return m;
    });
  }
  
  cachedConnection.conn = await cachedConnection.promise;
  return cachedConnection.conn;
};

// Database injection layer for handling incoming browser requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection failed", error: err.message });
  }
});

module.exports = app;