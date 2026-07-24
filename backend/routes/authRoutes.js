import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  logout,
  refreshAccessToken,
  registerAdmin
} from "../controllers/authController.js";
import validate from '../middleware/validateMiddleware.js';
import { adminLoginSchema, adminRegisterSchema } from '../validators/adminValidator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dedicated to login attempts so brute-force protection is scoped to login
// itself, instead of sharing a budget with unrelated dashboard/API traffic.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, validate(adminLoginSchema, 'body'), login);

router.post('/register', validate(adminRegisterSchema, 'body'), registerAdmin);

router.post('/refresh-token', refreshAccessToken);


router.post('/logout', protect, logout);

export default router;
