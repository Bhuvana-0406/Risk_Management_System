import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import morganMiddleware from './middleware/morganMiddleware.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import { ApiError } from './utils/ApiError.js'; 

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import reportRoutes from './routes/reportRoutes.js'; // Add this import
import analyticsRoutes from './routes/analyticsRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import returnRoutes from './routes/returns.js';

dotenv.config();

const app = express();

// --- Core Middleware ---
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
}));

console.log("FRONTEND_URL =", process.env.FRONTEND_URL);
// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8080",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Every Vercel deployment (preview or prod) of this project gets its own
// subdomain like risk-management-system-<hash>.vercel.app, so an exact
// allowlist breaks on each new deploy. Match the project prefix instead.
const allowedOriginPattern = /^https:\/\/risk-management-system-[\w-]+\.vercel\.app$/;

app.use(cors({
  origin(origin, callback) {
    console.log("Incoming Origin:", origin);

    if (!origin || allowedOrigins.includes(origin) || allowedOriginPattern.test(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked Origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use(morganMiddleware);

// Add request logging middleware before routes
app.use((req, res, next) => {
  if (req.url.includes('/approve')) {
    console.log(`🌐 INCOMING REQUEST: ${req.method} ${req.url}`);
    console.log(`🌐 Headers:`, req.headers);
    console.log(`🌐 Body:`, req.body);
    console.log(`🌐 Cookies:`, req.cookies);
  }
  next();
});

// --- Routes ---
console.log("Mounting routes...");
app.use('/api/reports', reportRoutes);
console.log("Reports routes mounted");
app.use('/api/auth', authRoutes);
console.log("Auth routes mounted");
app.use('/api/dashboard', dashboardRoutes);
console.log("Dashboard routes mounted");
app.use('/api/analytics', analyticsRoutes);
console.log("Analytics routes mounted");
app.use('/api/customers', customerRoutes);
console.log("Customer routes mounted");
app.use('/api/risk', riskRoutes);
console.log("Risk routes mounted");
app.use('/api/returns', returnRoutes);
console.log("Return routes mounted");

// app.use('/api/risk', riskRoutes); // Risk analysis routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use(errorMiddleware);

export default app;