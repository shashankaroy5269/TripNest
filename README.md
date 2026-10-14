<div align="center">

# 🏨 TripNest — Full-Stack Hotel & Holiday Trip Booking Platform

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-02042B.svg)](https://razorpay.com/)

**A modern, production-ready travel accommodation and holiday tour booking ecosystem featuring multi-role access control, live availability checks, Razorpay online payments, dynamic coupon discounts, PDF voucher generation, and an enterprise admin portal.**

[Explore Features](#-features) • [Tech Stack](#-tech-stack) • [System Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [Environment Variables](#-environment-variables) • [Demo Accounts](#-demo-credentials)

---

</div>

## 🌟 Highlights & Features

### 🧳 Customer Experience (`frontend/`)
- **Interactive Discovery:** Explore handpicked hotels, luxury villas, resorts, and multi-day holiday packages with rich imagery, amenity filters, and price breakdowns.
- **Real-Time Availability:** Prevents double bookings with intelligent date-range overlap verification.
- **Detailed Itineraries:** Day-by-day sightseeing schedules, meal plans, hotel stays, and transportation details for holiday packages.
- **Seamless Checkout:** Guest information collection, coupon redemption engine, and dynamic price calculations.
- **Secure Razorpay Payments:** Integrated payment modal supporting UPI, Cards, Netbanking, and Wallets with server-side HMAC signature verification.
- **Instant PDF Invoices & Vouchers:** Automated PDF booking voucher and invoice generation powered by PDFKit.
- **User Dashboard:** Track past and upcoming trips, cancel reservations, manage wishlists, and write verified reviews.

### 🛡️ Admin & Staff Management Portal (`admin/`)
- **Super Admin Dashboard:** Real-time revenue aggregates, booking metrics, user growth analytics, and property verification queues.
- **Property Moderation:** Review and approve or reject hotel listings submitted by partners.
- **Room & Inventory Control:** Manage room categories (Deluxe, Suite, Chalet, Family), pricing, discounts, and bed configurations.
- **Tour Package Management:** Create and edit multi-day holiday packages with day-wise itineraries, inclusions/exclusions, departure dates, and seat caps.
- **Coupons & Promotions:** Create fixed or percentage-based discount coupons with minimum spends, usage caps, and expiration dates.
- **Customer Inquiries & Concierge:** View and manage visitor contact inquiries and booking support tickets.

### ⚙️ Robust Backend & Security (`backend/`)
- **Enterprise Architecture:** Clean 4-layer design (`Routes` ➔ `Controllers` ➔ `Services` ➔ `Repositories` ➔ `Models`).
- **Secure Authentication:** Dual-token JWT system (short-lived Access Tokens + rotating Refresh Tokens) with client-side concurrency request queueing.
- **Role-Based Access Control (RBAC):** Granular permission checks for `SUPER_ADMIN`, `HOTEL_ADMIN`, `TRIP_MANAGER`, and `CUSTOMER`.
- **Validation & Sanitization:** Strict request validation using **Joi** schemas.
- **Media Management:** Cloudinary integration for scalable hotel and package image uploads.
- **Automated Emails:** Nodemailer integration for booking confirmations, invoices, and password resets.
- **Security Headers & Protection:** Helmet, CORS whitelisting, rate limiting, and cookie security.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend (Client)** | React 18, Vite, Tailwind CSS, Redux Toolkit, React Router DOM v6, Axios, Lucide React, Canvas Confetti |
| **Admin Portal** | Next.js 14 (App Router), React 18, Tailwind CSS, Context API, Lucide Icons, Axios |
| **Backend API** | Node.js, Express.js (v5), Mongoose (MongoDB ODM), Joi, Multer, PDFKit, Nodemailer |
| **Authentication & Security** | JSON Web Tokens (JWT), Bcrypt.js, Helmet, Express Rate Limit, Cookie Parser |
| **Cloud & Third-Party** | Razorpay (Payments), Cloudinary (Image Hosting), Unsplash (Demo Media) |
| **Testing & Tooling** | Jest, Nodemon, Morgan Logger |

---

## 📁 Repository Structure

```text
tripnest/
├── admin/                     # Next.js 14 Admin Portal
│   ├── src/
│   │   ├── app/               # App Router pages (login, dashboard, overview)
│   │   ├── components/        # Sidebar, Header, AdminNavbar, Tabs (Hotels, Bookings, etc.)
│   │   └── lib/               # AuthContext, API Axios client
│   └── package.json
│
├── backend/                   # Node.js + Express REST API
│   ├── src/
│   │   ├── config/            # Database, Cloudinary, Razorpay, Nodemailer configs
│   │   ├── constants/         # Roles, Booking Status, Payment Status constants
│   │   ├── controllers/       # HTTP Request & Response handlers
│   │   ├── middlewares/       # Auth, RBAC, File Upload, Error & Joi Validation
│   │   ├── models/            # Mongoose Schemas (User, Hotel, Room, Package, Booking, etc.)
│   │   ├── repositories/      # Data access layer
│   │   ├── routes/            # Express endpoint route definitions
│   │   ├── seed/              # Database seeding scripts (Admin & Full Demo Data)
│   │   ├── services/          # Core business logic (Payments, Booking, PDF, Emails)
│   │   └── utils/             # ApiResponse, AppError, AsyncHandler, Mailer
│   └── package.json
│
├── frontend/                  # React + Vite Customer Web App
│   ├── src/
│   │   ├── api/               # Axios client with auto-refresh queue interceptor
│   │   ├── components/        # Cards, Modals, Navbar, Footer, ProtectedRoute
│   │   ├── pages/             # Home, Hotels, Packages, Checkout, Dashboard
│   │   └── redux/             # Redux Toolkit slices and global store
│   └── package.json
│
└── package.json               # Root scripts for monorepo workflow
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have installed on your machine:
- **Node.js** (v18.0.0 or later)
- **npm** (v9.0.0 or later) or **yarn**
- **MongoDB** (Local instance or MongoDB Atlas URI)

---

### 1. Clone the Repository

```bash
git clone https://github.com/shashankaroy5269/TripNest.git
cd TripNest
```

---

### 2. Environment Configuration

#### 🔹 Backend (`backend/.env`)
Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URL=mongodb://localhost:27017/tripnest

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secret_access_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
COOKIE_NAME=tripnest_refresh

# Cloudinary (Media Storage)
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Nodemailer (Email Notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Razorpay (Payments)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin Secret
ADMIN_SECRET_KEY=your_admin_secret_phrase
```

#### 🔹 Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

#### 🔹 Admin (`admin/.env.local`)
Create a `.env.local` file inside the `admin/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### 3. Install Dependencies

You can install all dependencies from the root directory or inside each folder:

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Admin
cd ../admin && npm install

# Return to root
cd ..
```

---

### 4. Seed the Database

Populate MongoDB with demo destinations, luxury hotels, room inventories, holiday packages, coupons, and test user accounts:

```bash
cd backend
node src/seed/seedAll.js
```

> **Note:** To seed only a Super Admin user, run: `npm run seed:admin`

---

### 5. Running the Application

You can run each service independently or use the root convenience scripts:

#### Option A: Running from Root Monorepo
```bash
# Terminal 1 - Backend Server (Port 5000)
npm run dev:backend

# Terminal 2 - Frontend App (Port 5173)
npm run dev:frontend

# Terminal 3 - Admin Portal (Port 3000)
npm run dev:admin
```

#### Option B: Running from Individual Directories
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Admin
cd admin
npm run dev
```

| Application | URL | Description |
| :--- | :--- | :--- |
| **Backend API** | [http://localhost:5000/api](http://localhost:5000/api) | Express REST API server |
| **API Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Status verification |
| **Customer Web App** | [http://localhost:5173](http://localhost:5173) | Main React/Vite booking platform |
| **Admin Portal** | [http://localhost:3000](http://localhost:3000) | Next.js back-office dashboard |

---

## 🔑 Demo Credentials

After running `node src/seed/seedAll.js`, you can immediately log in with these pre-configured accounts:

| Role | Email Address | Password | Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@tripnest.com` | `Admin@123456` | Admin Portal (`:3000`) |
| **Hotel Admin** | `hoteladmin@tripnest.com` | `Hotel@123456` | Admin Portal (`:3000`) |
| **Trip Manager** | `tripmanager@tripnest.com` | `Trip@123456` | Admin Portal (`:3000`) |
| **Customer** | `customer@tripnest.com` | `Customer@123456` | Frontend App (`:5173`) |

---

## 🎟️ Active Demo Coupons

Test discount codes available upon database seeding:

- `WELCOME500`: ₹500 Flat OFF on orders above ₹2,500
- `TRIPNEST10`: 10% Discount (up to ₹2,000) on orders above ₹4,000
- `SUMMER2026`: ₹1,500 Flat OFF on orders above ₹10,000

---

## 📡 API Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer account | Public |
| `POST` | `/api/auth/login` | User login & token generation | Public |
| `POST` | `/api/auth/refresh-token` | Rotate & refresh access tokens | Authenticated |
| `GET` | `/api/hotels` | Search & filter hotel properties | Public |
| `GET` | `/api/hotels/:id` | Get hotel details & room listings | Public |
| `GET` | `/api/packages` | List all holiday packages | Public |
| `GET` | `/api/packages/:id` | Package details & day-wise itinerary | Public |
| `POST` | `/api/availability/check` | Check real-time room availability | Public |
| `POST` | `/api/bookings/hotel` | Create hotel room reservation | Customer |
| `POST` | `/api/bookings/package` | Create holiday package booking | Customer |
| `POST` | `/api/payments/create-order` | Generate Razorpay order ID | Customer |
| `POST` | `/api/payments/verify` | Verify payment signature & confirm booking | Customer |
| `GET` | `/api/bookings/:id/invoice` | Stream PDF booking voucher / invoice | Customer / Admin |
| `GET` | `/api/admin/overview` | Platform KPI metrics and statistics | Super Admin |
| `GET` | `/api/admin/aggregations`| Live revenue & occupancy analytics | Super Admin |

---

## 🧪 Testing

Execute backend test suites using Jest:

```bash
cd backend
npm test
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for passionate travelers & hospitality leaders.</sub>
</div>
