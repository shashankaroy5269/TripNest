# TripNest — Hotel & Holiday Booking System

TripNest is a full-stack web application designed for booking hotels, resorts, and curated tour packages. It includes a user-facing booking website, an administrative dashboard, and a Node.js REST API backend with MongoDB database.

---

## Features

### User Features
- **Search & Browse:** Search hotels and holiday packages by destination city, dates, and property type.
- **Room Categorization & Availability:** View rooms categorized by type (Deluxe, Suite, Family, etc.) and check real-time availability for selected dates.
- **Booking & Checkout:** Select room count, number of guests, apply promo codes, and complete booking.
- **Payment Integration:** Online payment flow using Razorpay test integration.
- **User Dashboard:** View booking confirmations, trip details, and download PDF receipts.

### Admin Features
- **Property Management:** Add new hotels, edit property details, and manage listings.
- **Room Inventory:** Add rooms, set prices, seasonal discounts, and bulk import rooms via CSV.
- **Tour Packages:** Create and manage multi-day travel itineraries.
- **Booking Overview:** Track all customer bookings and their current status.

---

## Tech Stack

- **Client Web App (`frontend/`):** React 18, Vite, Tailwind CSS, Redux Toolkit, React Router DOM
- **Admin Dashboard (`admin/`):** Next.js 14, React, Tailwind CSS
- **Backend API (`backend/`):** Node.js, Express.js, MongoDB & Mongoose
- **Third-Party Services:** Razorpay (test payments), Cloudinary (image uploads), Nodemailer

---

## Project Structure

```text
tripnest/
├── backend/       # Express.js REST API server
│   ├── src/
│   │   ├── config/        # Database and service configs
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Mongoose database schemas
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # Business logic
│   │   └── seed/          # Initial seed data
│   └── package.json
│
├── frontend/      # React + Vite Customer Booking App
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Public and customer pages
│   │   └── redux/         # State management
│   └── package.json
│
└── admin/         # Next.js Admin Portal
    ├── src/
    │   ├── app/           # Admin pages and layouts
    │   └── components/    # Admin tabs and controls
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB installed locally or MongoDB Atlas connection string
- npm or yarn

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/shashankaroy5269/TripNest.git
cd TripNest

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install

# Install Admin dependencies
cd ../admin
npm install
```

---

### 2. Environment Variables

#### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URL=mongodb://localhost:27017/tripnest

JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
COOKIE_NAME=tripnest_refresh

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_key
API_SECRET=your_cloudinary_secret
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_test_key
```

#### Admin (`admin/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### 3. Run the Applications

#### Start Backend:
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Start Frontend:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

#### Start Admin:
```bash
cd admin
npm run dev
# Admin runs on http://localhost:3000
```

---

## Database Seeding (Optional)

To seed initial hotels, rooms, and tour packages:
```bash
cd backend
npm run seed
```
