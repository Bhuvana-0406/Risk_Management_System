// backend/routes/customer.routes.js
import express from 'express';
import { getCustomers, getCustomerById } from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js'; // Assuming your auth middleware path

console.log("Customer routes file loaded successfully");

const router = express.Router();

// Test route (protected)
router.get('/test', protect, authorize(['admin', 'superadmin']), (req, res) => {
  res.json({ message: 'Customer routes are working!' });
});

// Get all customers with optional search and filter (admin only)
router.get('/', protect, authorize(['admin', 'superadmin']), getCustomers);

// Get a single customer by ID (admin only)
router.get('/:id', protect, authorize(['admin', 'superadmin']), getCustomerById);

export default router;
