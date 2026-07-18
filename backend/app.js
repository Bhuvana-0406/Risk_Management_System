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

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // Use environment variable
  ].filter(Boolean), // Remove undefined values
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

app.use(cors(corsOptions));

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