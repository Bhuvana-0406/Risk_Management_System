// backend/routes/return.routes.js
import express from 'express';
import { getReturnStats, getReturns, getReturnById } from '../controllers/returnController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize(['admin', 'superadmin']), getReturnStats);
router.get('/', protect, authorize(['admin', 'superadmin']), getReturns);
router.get('/:id', protect, authorize(['admin', 'superadmin']), getReturnById);

export default router;
