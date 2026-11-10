import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import carpetRoutes from './routes/carpets.js';
import reviewRoutes from './routes/reviews.js';
import { rateLimit } from './middleware/limits.js';
import orderRoutes from './routes/orders.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('X-Frame-Options', 'DENY');
  next();
});
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use('/api', rateLimit(180));
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(() => console.error('❌ MongoDB unavailable. Start the local database with: docker compose up -d mongodb, then restart the backend.'));

// Sign-in remains available while the catalog database is offline.
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'unavailable', database: connected ? 'connected' : 'disconnected' });
});
app.use(['/api/carpets', '/api/orders', '/api/reviews'], (req, res, next) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'The store database is unavailable. Please try again shortly.' });
  next();
});

// Routes
app.use('/api/carpets', carpetRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Kashif Rugs API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  const invalid = ['ValidationError', 'CastError', 'MulterError'].includes(err.name);
  res.status(invalid ? 400 : 500).json({ message: invalid ? 'Invalid input or upload. Check the fields and photo limits.' : 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

