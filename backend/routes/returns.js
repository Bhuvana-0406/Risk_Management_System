import express from "express";
const router = express.Router();

import { sendApprovalMail, sendRejectionMail } from "../utils/mailer.js";
import { getReturnStats, getReturns, getReturnById, approveReturn, rejectReturn } from '../controllers/returnController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Get return statistics
router.get('/stats', protect, authorize(['admin', 'superadmin']), getReturnStats);

// Get all returns with optional filtering
router.get('/', protect, authorize(['admin', 'superadmin']), getReturns);

// Get single return by ID
router.get('/:id', protect, authorize(['admin', 'superadmin']), getReturnById);

// Approve return and send email
router.post('/:id/approve', protect, authorize(['admin', 'superadmin']), (req, res, next) => {
  console.log(`🔥 APPROVE ROUTE HIT - Return ID: ${req.params.id}`);
  console.log(`🔥 Request Method: ${req.method}`);
  console.log(`🔥 Request URL: ${req.originalUrl}`);
  console.log(`🔥 User ID: ${req.user?.id}`);
  console.log(`🔥 User Role: ${req.user?.role}`);
  next();
}, approveReturn);

// Reject return and send email
router.post('/:id/reject', protect, authorize(['admin', 'superadmin']), (req, res, next) => {
  console.log(`🔥 REJECT ROUTE HIT - Return ID: ${req.params.id}`);
  console.log(`🔥 Request Method: ${req.method}`);
  console.log(`🔥 Request URL: ${req.originalUrl}`);
  console.log(`🔥 User ID: ${req.user?.id}`);
  console.log(`🔥 User Role: ${req.user?.role}`);
  next();
}, rejectReturn);

export default router;

