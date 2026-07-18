import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Protect this route, only allowing 'admin' or 'superadmin' roles to access
router.get('/', protect, authorize(['admin', 'superadmin']), getDashboardData);

export default router;
