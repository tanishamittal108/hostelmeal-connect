const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/database');
const { initSocket } = require('./socket/socketManager');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const menuRoutes = require('./routes/menu');
const voteRoutes = require('./routes/votes');
const orderRoutes = require('./routes/orders');
const subscriptionRoutes = require('./routes/subscriptions');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const providerRoutes = require('./routes/providers');
const deliveryRoutes = require('./routes/delivery');
const walletRoutes = require('./routes/wallet');
const couponRoutes = require('./routes/coupons');

// Cron jobs
const { finalizeVoting, sendSubscriptionReminders, generateDailyReport } = require('./utils/cronJobs');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Init Socket.io
initSocket(server);

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});

// CORS
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'HostelMeal Connect API is running 🚀', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/coupons', couponRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

// Cron Jobs
// Finalize voting every day at 7 PM
cron.schedule('0 19 * * *', () => {
  logger.info('Running voting finalization cron job...');
  finalizeVoting();
});

// Send subscription reminders at 9 AM
cron.schedule('0 9 * * *', () => {
  logger.info('Sending subscription reminders...');
  sendSubscriptionReminders();
});

// Generate daily report at midnight
cron.schedule('0 0 * * *', () => {
  logger.info('Generating daily analytics report...');
  generateDailyReport();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server };
