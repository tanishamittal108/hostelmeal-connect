const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//const dotenv = require('dotenv');
//dotenv.config({ path: '../.env' });

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.join(__dirname, '..', '.env')
});

console.log("__dirname =", __dirname);
console.log("MONGO_URI =", process.env.MONGO_URI);

const User = require('../models/User');
const Provider = require('../models/Provider');
const Menu = require('../models/Menu');
const { Coupon } = require('../models/index');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected for seeding');
};

const seedData = async () => {
  await connectDB();

  console.log('🌱 Starting seed...');

  // Clear existing data
  await User.deleteMany({});
  await Provider.deleteMany({});
  await Menu.deleteMany({});
  await Coupon.deleteMany({});

  // Create Admin
  const admin = await User.create({
    name: 'Admin User',
    email: process.env.ADMIN_EMAIL || 'admin@hostelmeal.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin',
    isVerified: true,
    phone: '9000000000',
  });
  console.log('✅ Admin created:', admin.email);

  // Create Providers
  const providerUsers = await User.create([
    { name: 'Sunita Devi', email: 'sunita@example.com', password: 'Provider@123', role: 'provider', isVerified: true, phone: '9111111111' },
    { name: 'Kamla Bai', email: 'kamla@example.com', password: 'Provider@123', role: 'provider', isVerified: true, phone: '9222222222' },
  ]);

  const providers = await Provider.create([
    {
      user: providerUsers[0]._id,
      businessName: 'Sunita Tiffin Service',
      description: 'Authentic Rajasthani home-cooked food with love ❤️',
      status: 'approved',
      fssaiNumber: 'FSSAI123456789',
      kitchenAddress: { street: 'Sector 5', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', coordinates: { lat: 26.9124, lng: 75.7873 } },
      cuisineTypes: ['North Indian', 'Rajasthani'],
      basePrice: 80,
      subscriptionPrice: 2000,
      avgRating: 4.5,
      totalRatings: 45,
      maxCapacity: 60,
      isAvailable: true,
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
      basePrice: 70,
      subscriptionPrice: 1800,
      avgRating: 4.2,
      totalRatings: 30,
      maxCapacity: 40,
      isAvailable: true,
      availableDays: ['monday','tuesday','wednesday','thursday','friday'],
      verifiedAt: new Date(),
    },
  ]);
  console.log('✅ Providers created');

  // Create Students
  const students = await User.create([
    { name: 'Rahul Kumar', email: 'rahul@example.com', password: 'Student@123', role: 'student', isVerified: true, phone: '9333333333', walletBalance: 500 },
    { name: 'Priya Sharma', email: 'priya@example.com', password: 'Student@123', role: 'student', isVerified: true, phone: '9444444444', walletBalance: 300 },
    { name: 'Amit Singh', email: 'amit@example.com', password: 'Student@123', role: 'student', isVerified: true, phone: '9555555555', walletBalance: 200 },
  ]);
  console.log('✅ Students created');

  // Create Delivery Partner
  const deliveryUser = await User.create({
    name: 'Ramesh Delivery', email: 'ramesh@example.com', password: 'Delivery@123',
    role: 'delivery', isVerified: true, phone: '9666666666',
  });
  const { DeliveryPartner } = require('../models/index');
  await DeliveryPartner.create({
    user: deliveryUser._id,
    vehicleType: 'scooter',
    vehicleNumber: 'RJ14AB1234',
    verificationStatus: 'approved',
    isAvailable: true,
  });
  console.log('✅ Delivery partner created');

  // Create Today's Menu
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await Menu.create([
    {
      provider: providers[0]._id,
      date: today,
      sabjiOptions: [
        { name: 'Aloo Gobi', description: 'Spiced potato and cauliflower', calories: 180, protein: 5, voteCount: 23 },
        { name: 'Palak Paneer', description: 'Cottage cheese in spinach gravy', calories: 250, protein: 12, voteCount: 45 },
        { name: 'Dal Makhani', description: 'Slow cooked black lentils', calories: 300, protein: 15, voteCount: 18 },
        { name: 'Mix Veg', description: 'Seasonal vegetables', calories: 150, protein: 4, voteCount: 10 },
        { name: 'Rajma', description: 'Red kidney beans curry', calories: 280, protein: 14, voteCount: 35 },
        { name: 'Baingan Bharta', description: 'Roasted eggplant mash', calories: 120, protein: 3, voteCount: 8 },
      ],
      dalOptions: [
        { name: 'Dal Tadka', voteCount: 40 },
        { name: 'Moong Dal', voteCount: 25 },
        { name: 'Chana Dal', voteCount: 15 },
      ],
      rotiRiceOptions: [
        { name: 'Roti (4 pcs)', voteCount: 55 },
        { name: 'Jeera Rice', voteCount: 30 },
        { name: 'Paratha (2 pcs)', voteCount: 20 },
      ],
      sweetDishOptions: [
        { name: 'Gulab Jamun', description: '2 pieces', calories: 150, voteCount: 60 },
        { name: 'Kheer', description: 'Rice pudding', calories: 200, voteCount: 25 },
        { name: 'Halwa', description: 'Semolina sweet', calories: 180, voteCount: 15 },
        { name: 'Rasgulla', description: '2 pieces', calories: 120, voteCount: 10 },
      ],
      basePrice: 80,
      finalPrice: 85,
      status: 'voting_open',
      votingOpenAt: new Date(today.getTime() - 30 * 60 * 1000),
      votingCloseAt: new Date(today.getTime() + 30 * 60 * 1000),
      totalVotesCast: 52,
    }
  ]);
  console.log('✅ Sample menu created');

  // Create Coupons
  await Coupon.create([
    {
      code: 'WELCOME50',
      title: 'Welcome Discount',
      description: '50% off on your first order (max ₹50)',
      type: 'percentage',
      value: 50,
      maxDiscount: 50,
      minOrderAmount: 80,
      usageLimit: 500,
      perUserLimit: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      applicableTo: 'new_users',
    },
    {
      code: 'FLAT20',
      title: 'Flat ₹20 Off',
      description: 'Flat ₹20 off on orders above ₹100',
      type: 'fixed',
      value: 20,
      minOrderAmount: 100,
      usageLimit: 1000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'HOSTEL10',
      title: 'Hostel Special',
      description: '10% off for hostel students',
      type: 'percentage',
      value: 10,
      maxDiscount: 30,
      usageLimit: 2000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log('✅ Coupons created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin:    admin@hostelmeal.com / Admin@123456');
  console.log('🍳 Provider: sunita@example.com  / Provider@123');
  console.log('🎓 Student:  rahul@example.com   / Student@123');
  console.log('🛵 Delivery: ramesh@example.com  / Delivery@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.connection.close();
  process.exit(0);
};

seedData().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});


console.log("ENV FILE LOADED");
console.log("MONGO_URI:", process.env.MONGO_URI);