import express from 'express';
import {
    calculateCustomerRisk,
    getCustomerRisk,
    getAllRisks
} from '../controllers/riskAnalysisController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { calculateRiskParamsSchema } from '../validators/returnRiskValidator.js';

const router = express.Router();

// GET /api/risk - Get all risk analyses (Admin/Superadmin only)
router.route('/')
    .get(protect, authorize(['admin', 'superadmin']), getAllRisks);

// POST /api/risk/calculate/:customerId - Calculate risk for a specific customer
// Applies Joi validation for the customerId in URL parameters
router.route('/calculate/:customerId')
    .post(protect, authorize(['admin', 'superadmin']), validate(calculateRiskParamsSchema, 'params'), calculateCustomerRisk);

// GET /api/risk/:customerId - Get risk for a specific customer
// Applies Joi validation for the customerId in URL parameters
router.route('/:customerId')
    .get(protect, authorize(['admin', 'superadmin']), validate(calculateRiskParamsSchema, 'params'), getCustomerRisk);

export default router;
