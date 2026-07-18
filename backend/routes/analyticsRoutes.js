import express from 'express';
import { getAnalyticsData } from '../controllers/analytics.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/analytics - Get analytics data (admin only)
router.get('/', protect, authorize(['admin', 'superadmin']), getAnalyticsData);

console.log("Analytics routes file loaded successfully");

export default router;