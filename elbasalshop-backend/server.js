const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-frontend-domain.com'
    : '*', // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging
app.use(helmet()); // Security headers

// Rate limiting - عشان نحمي السيرفر من الطلبات الكتيرة
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 200, // 200 طلب كحد أقصى كل 15 دقيقة
  message: {
    success: false,
    message: 'طلبات كتير من نفس الـ IP، جرب تاني بعد شوية'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// تطبيق الـ rate limiting على كل الـ API routes
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'مرحباً بك في البصال شوب API 🛍️',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders'
    },
    status: 'السيرفر شغال بنجاح ✅'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ خطأ:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'حدث خطأ في السيرفر',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'الصفحة أو الـ API endpoint مش موجود'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال في وضع ${process.env.NODE_ENV} على البورت ${PORT}`);
  console.log(`📡 API متاح على: http://localhost:${PORT}/api`);
  console.log(`📦 الأقسام: http://localhost:${PORT}/api/categories`);
  console.log(`🛍️  المنتجات: http://localhost:${PORT}/api/products`);
});