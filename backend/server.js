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
app.set('trust proxy', 1);
const server = http.createServer(app);

// Connect Database
connectDB();

const autoSeed = async () => {
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    
    if (count === 0) {
      logger.info('🌱 Empty DB — Auto seeding...');
      
      const Provider = require('./models/Provider');
      const Menu = require('./models/Menu');
      const { Coupon, DeliveryPartner } = require('./models/index');

      await User.deleteMany({});
      await Provider.deleteMany({});
      await Menu.deleteMany({});
      await Coupon.deleteMany({});

      const admin = await User.create({
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@hostelmeal.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin', isVerified: true, phone: '9000000000',
      });

      const providerUsers = await User.create([
        { name: 'Sunita Devi', email: 'sunita@example.com', password: 'Provider@123', role: 'provider', isVerified: true, phone: '9111111111' },
        { name: 'Kamla Bai', email: 'kamla@example.com', password: 'Provider@123', role: 'provider', isVerified: true, phone: '9222222222' },
      ]);

      const providers = await Provider.create([
        {
          user: providerUsers[0]._id,
          businessName: 'Sunita Tiffin Service',
          description: 'Authentic Rajasthani home-cooked food with love ❤️',
          status: 'approved', fssaiNumber: 'FSSAI123456789',
          kitchenAddress: { street: 'Sector 5', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', coordinates: { lat: 26.9124, lng: 75.7873 } },
          cuisineTypes: ['North Indian', 'Rajasthani'],
          basePrice: 80, subscriptionPrice: 2000,
          avgRating: 4.5, totalRatings: 45, maxCapacity: 60, isAvailable: true,
          availableDays: ['monday','tuesday','wednesday','thursday','friday','saturday'],
          verifiedAt: new Date(),
        },
        {
          user: providerUsers[1]._id,
          businessName: 'Kamla Home Kitchen',
          description: 'Pure vegetarian Gujarati thali 🍱',
          status: 'approved',
          kitchenAddress: { street: 'Gandhi Nagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009', coordinates: { lat: 23.0225, lng: 72.5714 } },
          cuisineTypes: ['Gujarati', 'North Indian'],
          basePrice: 70, subscriptionPrice: 1800,
          avgRating: 4.2, totalRatings: 30, maxCapacity: 40, isAvailable: true,
          availableDays: ['monday','tuesday','wednesday','thursday','friday'],
          verifiedAt: new Date(),
        },
      ]);

      await User.create([
        { name: 'Rahul Kumar', email: 'rahul@example.com', password: 'Student@123', role: 'student', isVerified: true, phone: '9333333333', walletBalance: 500 },
        { name: 'Priya Sharma', email: 'priya@example.com', password: 'Student@123', role: 'student', isVerified: true, phone: '9444444444', walletBalance: 300 },
        { name: 'Amit Singh', email: 'amit@example.com', password: 'Student@123', role: 'student', isVerified: true, phone: '9555555555', walletBalance: 200 },
      ]);

      const deliveryUser = await User.create({
        name: 'Ramesh Delivery', email: 'ramesh@example.com', password: 'Delivery@123',
        role: 'delivery', isVerified: true, phone: '9666666666',
      });
      await DeliveryPartner.create({
        user: deliveryUser._id, vehicleType: 'scooter',
        vehicleNumber: 'RJ14AB1234', verificationStatus: 'approved', isAvailable: true,
      });

      const today = new Date(); today.setHours(0,0,0,0);
      await Menu.create([{
        provider: providers[0]._id, date: today,
        sabjiOptions: [
          { name: 'Aloo Gobi', description: 'Spiced potato and cauliflower', calories: 180, protein: 5, voteCount: 23 },
          { name: 'Palak Paneer', description: 'Cottage cheese in spinach gravy', calories: 250, protein: 12, voteCount: 45 },
          { name: 'Dal Makhani', description: 'Slow cooked black lentils', calories: 300, protein: 15, voteCount: 18 },
          { name: 'Rajma', description: 'Red kidney beans curry', calories: 280, protein: 14, voteCount: 35 },
        ],
        dalOptions: [{ name: 'Dal Tadka', voteCount: 40 }, { name: 'Moong Dal', voteCount: 25 }],
        rotiRiceOptions: [{ name: 'Roti (4 pcs)', voteCount: 55 }, { name: 'Jeera Rice', voteCount: 30 }],
        sweetDishOptions: [{ name: 'Gulab Jamun', description: '2 pieces', calories: 150, voteCount: 60 }],
        basePrice: 80, finalPrice: 85, status: 'voting_open',
        votingOpenAt: new Date(today.getTime() - 30*60*1000),
        votingCloseAt: new Date(today.getTime() + 30*60*1000),
        totalVotesCast: 52,
      }]);

      await Coupon.create([
        { code: 'WELCOME50', title: 'Welcome Discount', description: '50% off first order', type: 'percentage', value: 50, maxDiscount: 50, minOrderAmount: 80, usageLimit: 500, perUserLimit: 1, validFrom: new Date(), validUntil: new Date(Date.now() + 90*24*60*60*1000), applicableTo: 'new_users' },
        { code: 'FLAT20', title: 'Flat ₹20 Off', description: 'Flat ₹20 off above ₹100', type: 'fixed', value: 20, minOrderAmount: 100, usageLimit: 1000, validFrom: new Date(), validUntil: new Date(Date.now() + 30*24*60*60*1000) },
        { code: 'HOSTEL10', title: 'Hostel Special', description: '10% off for hostel students', type: 'percentage', value: 10, maxDiscount: 30, usageLimit: 2000, validFrom: new Date(), validUntil: new Date(Date.now() + 60*24*60*60*1000) },
      ]);

      logger.info('✅ Auto-seed complete! Admin: admin@hostelmeal.com / Admin@123456');
    } else {
      logger.info(`✅ DB has ${count} users — skipping seed`);
    }
  } catch (err) {
    logger.error(`❌ Auto-seed failed: ${err.message}`);
  }
};

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
  origin: [
    process.env.CLIENT_URL,
    'https://hostelmeal-connect.vercel.app',  // ← Yeh add karo
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT','DELETE', 'PATCH'],
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
  autoSeed();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server };
