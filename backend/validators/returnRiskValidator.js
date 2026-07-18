import Joi from 'joi';

// Joi schema for validating the customer ID in risk calculation requests
// Using regex pattern for MongoDB ObjectId validation
const calculateRiskParamsSchema = Joi.object({
    customerId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid Customer ID format - must be a valid MongoDB ObjectId',
            'any.required': 'Customer ID is required in URL'
        })
});

// If your risk calculation endpoint accepts additional dynamic factors in the body,
// you would define a schema for that here. For now, it's based on URL param.
const calculateRiskBodySchema = Joi.object({
    // Example: if you can manually override factors
    customFactors: Joi.object().pattern(Joi.string(), Joi.number().min(0))
}).optional();

export { calculateRiskParamsSchema, calculateRiskBodySchema };
