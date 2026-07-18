import express from 'express';
import { Parser } from 'json2csv';
import Customer from '../models/Customer.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate customer risk summary CSV (admin only)
router.get('/generate-customer-risk-summary', protect, authorize(['admin', 'superadmin']), async (req, res) => {
  try {
    const customers = await Customer.find();

    const fields = ['name', 'email', 'riskScore']; // change based on schema
    const parser = new Parser({ fields });
    const csv = parser.parse(customers);

    res.header('Content-Type', 'text/csv');
    res.attachment('customer-risk-summary.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV generation failed:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
