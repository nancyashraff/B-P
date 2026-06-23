const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

// ── 1. GLOBAL DATABASE CONNECTION CACHE ──
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
      console.log('MongoDB connected successfully');
      return m;
    });
  }
  
  cachedConnection.conn = await cachedConnection.promise;
  return cachedConnection.conn;
};

// ── 2. FORCE DB CONNECTION BEFORE ANY ROUTE RUNS ──
// Moving this here guarantees that cold starts wait for MongoDB to wake up!
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection failed", error: err.message });
  }
});

// ── 3. STATIC PATHS & PAGES ──
const frontendPath = path.resolve(__dirname, '../Frontend');
app.use(express.static(frontendPath));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── 4. ALL API ROUTES ──
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

// ── 5. LOCAL IMAGE SYNC (OFF ON VERCEL) ──
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

module.exports = app;