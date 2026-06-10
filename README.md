# 🍛 HostelMeal Connect

> **Ghar Jaisa Khana, Hostel Tak!**
> 
> A production-ready MERN stack platform connecting hostel students with home chefs through a unique daily voting system, real-time delivery tracking, and subscription meal plans.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Test Credentials](#test-credentials)

---

## ✨ Features

### For Students
- 🗳️ **Daily Voting** — Vote for sabji & sweet dish from 6–7 PM
- 📱 **Live Menu** — Real-time vote counts via Socket.io
- 🛵 **Order Tracking** — Live delivery with OTP verification
- 💰 **Wallet System** — Recharge & pay instantly
- 📅 **Subscriptions** — Weekly & monthly meal plans
- 🎁 **Referral & Loyalty** — Earn rewards on every order
- 💬 **In-app Chat** — Message providers directly

### For Home Chefs / Providers
- 📋 **Menu Management** — Upload 6 sabji, 3 dal, 4 sweet options
- 📊 **Real-time Analytics** — Revenue, order trends, top dishes
- 🔔 **Live Order Alerts** — Accept/reject via dashboard
- 💸 **Earnings Dashboard** — Track daily & monthly income
- 📸 **Kitchen Gallery** — Showcase your kitchen

### For Delivery Partners
- 🗺️ **Route Management** — Optimized pickup & delivery
- 📲 **OTP Delivery** — Secure verified handover
- 💰 **Earnings Tracker** — Per delivery earnings

### For Admin
- 📈 **Analytics Dashboard** — Revenue, users, orders with charts
- ✅ **Provider Verification** — Approve/reject with email notification
- 🚫 **User Management** — Ban/unban users
- 🎟️ **Coupon System** — Create & manage discount codes
- 🤖 **AI Insights** — Demand prediction & food recommendations

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion |
| State | Redux Toolkit + React Query |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Refresh Tokens + bcrypt |
| Real-time | Socket.io |
| Payments | Razorpay |
| Media | Cloudinary + Multer |
| Email | Nodemailer (Gmail SMTP) |
| Charts | Recharts |
| Deploy | Vercel (FE) + Render/Railway (BE) + MongoDB Atlas |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/hostelmeal-connect.git
cd hostelmeal-connect
```

### 2. Setup Backend
```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your credentials (see Environment Setup below)

# Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env (usually just needs VITE_API_URL=/api)

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Open in Browser
Navigate to `http://localhost:5173` and use the demo credentials below! 🎉

---

## 🔧 Environment Setup

### Backend `.env`
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/hostelmeal

# JWT (use strong random strings in production)
JWT_SECRET=your-super-secret-key-at-least-32-characters
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-at-least-32-chars
JWT_REFRESH_EXPIRE=30d

# Cloudinary (https://cloudinary.com - free tier)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail SMTP (use App Password, not your real password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
FROM_EMAIL=noreply@hostelmealconnect.com
FROM_NAME=HostelMeal Connect

# Razorpay (https://razorpay.com - test keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Frontend URL (for email links)
CLIENT_URL=http://localhost:5173

# Admin credentials (for seeding)
ADMIN_EMAIL=admin@hostelmeal.com
ADMIN_PASSWORD=Admin@123456
```

### Frontend `.env`
```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

---

## 👥 Test Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| 🎓 Student | `rahul@example.com` | `Student@123` |
| 👨‍🍳 Provider | `sunita@example.com` | `Provider@123` |
| 🛵 Delivery | `ramesh@example.com` | `Delivery@123` |
| 👑 Admin | `admin@hostelmeal.com` | `Admin@123456` |

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |
| POST | `/auth/verify-email/:token` | Verify email |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password/:token` | Reset password |
| PUT | `/auth/update-password` | Change password |

### Menu Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/menu/today` | Get today's menus |
| POST | `/menu/create` | Create menu (provider) |
| PUT | `/menu/:id/publish` | Publish menu for voting |
| GET | `/menu/:id` | Get single menu |

### Vote Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/votes/today` | Today's voting menus |
| GET | `/votes/menu/:id` | Menu vote details |
| POST | `/votes/cast` | Cast/update vote |
| POST | `/votes/finalize/:id` | Finalize voting |

### Order Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/create` | Place order |
| GET | `/orders/my` | Get my orders |
| GET | `/orders/:id` | Get order details |
| PUT | `/orders/:id/status` | Update status |
| POST | `/orders/:id/cancel` | Cancel order |
| POST | `/orders/:id/verify-delivery` | OTP verify delivery |

### Payment Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallet` | Get wallet & transactions |
| POST | `/wallet/topup` | Create Razorpay topup order |
| POST | `/wallet/topup/confirm` | Confirm wallet topup |
| POST | `/payments/verify` | Verify Razorpay payment |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users |
| PUT | `/admin/users/:id/ban` | Ban user |
| GET | `/admin/providers/pending` | Pending providers |
| PUT | `/admin/providers/:id/approve` | Approve provider |

---

## 🔌 Socket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_menu` | `menuId` | Join voting room |
| `leave_menu` | `menuId` | Leave voting room |
| `join_provider` | `providerId` | Join provider room |
| `update_location` | `{lat, lng}` | Update delivery location |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `vote_update` | Vote counts | Real-time vote changes |
| `menu_finalized` | Menu data | Voting closed, menu set |
| `new_order` | Order data | New order for provider |
| `order_status_update` | Status | Order status changed |
| `delivery_location_update` | Location | Live delivery tracking |
| `new_message` | Message | Chat message received |

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build

# Install Vercel CLI
npm i -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard:
```
VITE_API_URL=https://your-backend.railway.app/api
VITE_SOCKET_URL=https://your-backend.railway.app
```

### Backend → Railway
```bash
# Install Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up
```

Add all `.env` variables in Railway dashboard.

### Database → MongoDB Atlas
1. Create free cluster at https://cloud.mongodb.com
2. Create database user
3. Whitelist IP: `0.0.0.0/0` (all IPs)
4. Get connection string → paste in `MONGO_URI`

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Seed data
docker-compose exec backend npm run seed

# Stop
docker-compose down
```

---

## 🗂 Project Structure

```
hostelmeal-connect/
├── backend/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── cloudinary.js    # File upload config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── voteController.js
│   │   └── combinedControllers.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect/authorize
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Provider.js
│   │   ├── Menu.js
│   │   ├── Order.js
│   │   ├── Vote.js
│   │   └── index.js         # Subscription, Notification, Review, Chat...
│   ├── routes/
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   ├── votes.js
│   │   └── ... (13 route files)
│   ├── seeds/
│   │   └── seedData.js      # Sample data for development
│   ├── socket/
│   │   └── socketManager.js # Socket.io setup
│   ├── utils/
│   │   ├── logger.js        # Winston logger
│   │   ├── sendEmail.js     # Nodemailer
│   │   └── cronJobs.js      # Scheduled tasks
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Navbar, Footer, shared UI
│   │   │   └── layouts/     # Dashboard layouts per role
│   │   ├── pages/
│   │   │   ├── public/      # Home, Login, Register...
│   │   │   ├── student/     # Dashboard, Voting, Orders...
│   │   │   ├── provider/    # Dashboard, Menu, Analytics...
│   │   │   ├── delivery/    # Dashboard, Active, Earnings
│   │   │   └── admin/       # Dashboard, Users, Providers...
│   │   ├── services/
│   │   │   ├── api.js       # Axios + all API functions
│   │   │   └── socket.js    # Socket.io client
│   │   ├── store/
│   │   │   ├── index.js
│   │   │   └── slices/      # auth, ui, cart, notifications
│   │   ├── App.jsx          # Router with role-based guards
│   │   ├── main.jsx
│   │   └── index.css        # Tailwind + custom classes
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🧪 Running Tests

```bash
# Backend tests (add Jest setup)
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🔑 Key Features Deep Dive

### Daily Voting Flow
```
3:00 PM  → Provider uploads menu (6 sabji, 3 dal, 4 sweet options)
6:00 PM  → Voting window opens (via cron job)
6-7 PM   → Students vote in real-time (Socket.io broadcasts live counts)
7:00 PM  → Voting closes, menu auto-finalized (cron job)
7:00 PM  → Dynamic pricing calculated based on demand
7:00 PM  → Notifications sent to all subscribed students
8-9 PM   → Food delivered with OTP verification
```

### Dynamic Pricing Logic
```javascript
basePrice = provider.basePrice (e.g., ₹80)
demandMultiplier = votes > 100 ? 1.2 : votes > 50 ? 1.1 : 1.0
specialSurcharge = sweetDish.includes('gulab') ? ₹10 : 0
finalPrice = round(basePrice × demandMultiplier + specialSurcharge)
```

### Wallet System
- Email verification → +₹25 welcome bonus
- Referral reward → +₹50 per referral
- Order payment → loyalty points (totalAmount ÷ 10)
- Delivered order → +20 loyalty points
- Subscription savings → up to 20% vs daily ordering

---

## 📱 Mobile Responsive

The UI is fully responsive with:
- Mobile-first design
- Bottom navigation bar for mobile dashboards
- Touch-friendly voting cards
- Swipe-friendly order tracking
- PWA-ready (add manifest.json for full PWA)

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use for personal and commercial projects.

---

## 🙏 Credits

Built with ❤️ for hostel students across India.

**Stack Highlights:**
- React 18 + Vite for blazing-fast frontend
- Socket.io for real-time voting & tracking
- Razorpay for seamless Indian payments
- Cloudinary for optimized image delivery
- MongoDB Atlas for scalable cloud database

---

*"Hostel mein ghar ka khana — ab ek click mein!" 🍛*
