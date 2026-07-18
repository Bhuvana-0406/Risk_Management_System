import Customer from '../models/Customer.js';
import ReturnRisk from '../models/ReturnRisk.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * @function calculateCustomerRisk
 * @description Calculates and stores the return risk for a specific customer.
 * This is a simplified example; a real-world scenario would involve more complex logic.
 * @route POST /api/risk/calculate/:customerId
 * @access Private (Admin only)
 */
const calculateCustomerRisk = asyncHandler(async (req, res) => {
    // Joi validation middleware ensures customerId in params is valid.
    const { customerId } = req.params;
    // You could also accept specific factors from req.body if the calculation is dynamic
    // const { customFactors } = req.body;

    const customer = await Customer.findById(customerId);

    if (!customer) {
        throw new ApiError(404, 'Customer not found');
    }

    // --- Simplified Risk Calculation Logic ---
    // In a real application, this would be a sophisticated algorithm
    // involving historical data, product categories, customer behavior, etc.

    let riskScore = 0;
    let riskLevel = 'Low';
    const factors = new Map(); // Keep as Map during calculation for convenience

    // Factor 1: High return rate
    if (customer.totalOrders > 0) {
        const calculatedReturnRate = (customer.totalReturns / customer.totalOrders) * 100;
        customer.returnRate = calculatedReturnRate; // Update customer's return rate
        factors.set('returnRate', calculatedReturnRate);

        if (calculatedReturnRate >= 20) {
            riskScore += 40;
            factors.set('highReturnRate', 1);
        } else if (calculatedReturnRate >= 10) {
            riskScore += 20;
            factors.set('mediumReturnRate', 1);
        }
    }

    // Factor 2: Number of returns
    if (customer.totalReturns >= 5) {
        riskScore += 30;
        factors.set('frequentReturns', 1);
    } else if (customer.totalReturns >= 2) {
        riskScore += 15;
        factors.set('someReturns', 1);
    }

    // Factor 3: Last return date (e.g., recent returns increase risk)
    if (customer.lastReturnDate) {
        const daysSinceLastReturn = (Date.now() - customer.lastReturnDate.getTime()) / (1000 * 60 * 60 * 24);
        factors.set('daysSinceLastReturn', daysSinceLastReturn);
        if (daysSinceLastReturn <= 30) { // Within last 30 days
            riskScore += 25;
            factors.set('recentReturn', 1);
        }
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    // Determine risk level based on score
    if (riskScore >= 80) {
        riskLevel = 'Critical';
    } else if (riskScore >= 50) {
        riskLevel = 'High';
    } else if (riskScore >= 20) {
        riskLevel = 'Medium';
    } else {
        riskLevel = 'Low';
    }

    // --- End Simplified Risk Calculation Logic ---

    let returnRisk = await ReturnRisk.findOne({ customer: customer._id });

    // Convert Map to plain object for Mongoose storage
    const factorsObject = Object.fromEntries(factors);

    if (returnRisk) {
        // Update existing risk entry
        returnRisk.riskScore = riskScore;
        returnRisk.riskLevel = riskLevel;
        returnRisk.analysisDate = Date.now();
        returnRisk.factors = factorsObject; // Use the converted object
        returnRisk.recommendations = ['Review customer return history', 'Consider limiting future returns']; // Example
    } else {
        // Create new risk entry
        returnRisk = await ReturnRisk.create({
            customer: customer._id,
            riskScore,
            riskLevel,
            factors: factorsObject, // Use the converted object
            recommendations: ['Monitor return patterns'] // Example
        });
    }

    // Save customer updates (e.g., returnRate)
    await customer.save();

    const savedRisk = await returnRisk.save();

    // Update the customer's riskAnalysis reference
    customer.riskAnalysis = savedRisk._id;
    await customer.save();


    res.status(200).json(
        new ApiResponse(200, { risk: savedRisk, customer: customer }, 'Customer risk calculated and updated successfully')
    );
});

/**
 * @function getCustomerRisk
 * @description Retrieves the return risk for a specific customer.
 * @route GET /api/risk/:customerId
 * @access Private (Admin only)
 */
const getCustomerRisk = asyncHandler(async (req, res) => {
    // Joi validation middleware ensures customerId in params is valid.
    const risk = await ReturnRisk.findOne({ customer: req.params.customerId }).populate('customer');

    if (!risk) {
        throw new ApiError(404, 'Risk analysis not found for this customer');
    }
    res.status(200).json(
        new ApiResponse(200, risk, 'Customer risk fetched successfully')
    );
});

/**
 * @function getAllRisks
 * @description Retrieves all return risk analyses.
 * @route GET /api/risk
 * @access Private (Admin only)
 */
const getAllRisks = asyncHandler(async (req, res) => {
    const risks = await ReturnRisk.find({}).populate('customer');
    res.status(200).json(
        new ApiResponse(200, risks, 'All risks fetched successfully')
    );
});


export {
    calculateCustomerRisk,
    getCustomerRisk,
    getAllRisks
};
