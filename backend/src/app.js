const express =
  require("express");

const cors =
  require("cors");

const helmet =
  require("helmet");

const cookieParser =
  require("cookie-parser");

const morgan =
  require("morgan");


const ApiResponse =
  require("./utils/apiResponse");

const authRoutes =
  require("./routes/auth.routes");

const errorMiddleware =
  require(
    "./middlewares/error.middleware"
  );

  const userRoutes =
  require("./routes/user.routes");

const adminRoutes =
  require("./routes/admin.routes");

  const hotelRoutes =
  require(
    "./routes/hotel.routes"
  );
  const roomRoutes =
  require(
    "./routes/room.routes"
  );
  const availabilityRoutes =
  require(
    "./routes/availability.routes"
  );
  const bookingRoutes =
  require(
    "./routes/booking.routes"
  );
  const paymentRoutes =
  require("./routes/payment.routes");
const packageRoutes =
  require("./routes/package.routes");
const couponRoutes =
  require("./routes/coupon.routes");
const reviewRoutes =
  require("./routes/review.routes");
const wishlistRoutes =
  require("./routes/wishlist.routes");
const inquiryRoutes =
  require("./routes/inquiry.routes");


const app =
  express();


// ==========================
// SECURITY
// ==========================

app.use(
  helmet()
);


// ==========================
// CORS
// ==========================

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);


// ==========================
// BODY PARSER
// ==========================

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true
  })
);


// ==========================
// COOKIE
// ==========================

app.use(
  cookieParser()
);


// ==========================
// LOGGER
// ==========================

if (
  process.env.NODE_ENV !==
  "production"
) {

  app.use(
    morgan("dev")
  );
}


// ==========================
// HEALTH CHECK
// ==========================

app.get(
  "/api/health",

  (req, res) => {

    res.status(200).json({

      success: true,

      message:
        "TripNest API is running"

    });
  }
);


// ==========================
// ROUTES
// ==========================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/hotels",
  hotelRoutes
);

app.use(
  "/api/rooms",
  roomRoutes
);

app.use(
  "/api/availability",
  availabilityRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/packages",
  packageRoutes
);

app.use(
  "/api/coupons",
  couponRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/wishlist",
  wishlistRoutes
);

app.use(
  "/api/inquiries",
  inquiryRoutes
);

// ==========================
// 404 HANDLER FOR UNMATCHED ROUTES
// ==========================

app.use((req, res, next) => {
  return ApiResponse.error(res, {
    statusCode: 404,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// ==========================
// ERROR HANDLER
// ==========================

app.use(
  errorMiddleware
);


module.exports =
  app;