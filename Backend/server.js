const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../Frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/admin', require('./routes/admin'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── VERCEL SAFE STARTUP IMAGE SYNC ──
// Wrapped in an environment check so it runs locally, but won't crash on Vercel's read-only system
if (process.env.NODE_ENV !== 'production') {
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
}

// ── GLOBAL DATABASE CONNECTION CACHE (FOR VERCEL) ──
let cachedConnection = global.mongoose;

if (!cachedConnection) {
  cachedConnection = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If a connection already exists in memory, reuse it immediately (No cold start delay!)
  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }

  // If no connection is active, create a single shared promise pool
  if (!cachedConnection.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Prevents multiple serverless instances from spamming Atlas
    };

    cachedConnection.promise = mongoose.connect(process.env.MONGO_URI, opts).then((m) => {
      console.log('MongoDB connected (New Pool)');
      return m;
    });
  }
  
  cachedConnection.conn = await cachedConnection.promise;
  return cachedConnection.conn;
};

// ── EXECUTE CONNECTION BEFORE SERVER PROCESSES REQUESTS ──
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection failed", error: err.message });
  }
});

module.exports = app;