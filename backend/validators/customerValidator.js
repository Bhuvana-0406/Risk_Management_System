import Joi from 'joi';

// Joi schema for creating a new customer
const createCustomerSchema = Joi.object({
    customerId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Customer ID cannot be empty',
            'any.required': 'Customer ID is required'
        }),
    name: Joi.string()
        .min(3)
        .required()
        .messages({
            'string.min': 'Customer name must be at least 3 characters long',
            'string.empty': 'Customer name cannot be empty',
            'any.required': 'Customer name is required'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    address: Joi.string().allow(''),
    totalOrders: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .required()
        .messages({
            'number.base': 'Total orders must be a number',
            'number.integer': 'Total orders must be an integer',
            'number.min': 'Total orders cannot be negative',
            'any.required': 'Total orders is required'
        }),
    totalReturns: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .required()
        .messages({
            'number.base': 'Total returns must be a number',
            'number.integer': 'Total returns must be an integer',
            'number.min': 'Total returns cannot be negative',
            'any.required': 'Total returns is required'
        }),
    totalSpent: Joi.number() // Added totalSpent validation
        .min(0)
        .default(0.0)
        .required()
        .messages({
            'number.base': 'Total spent must be a number',
            'number.min': 'Total spent cannot be negative',
            'any.required': 'Total spent is required'
        }),
    returnRate: Joi.number().min(0).max(100).optional(), // Optional as it's calculated by backend
    lastReturnDate: Joi.date().iso().optional(),
    riskAnalysis: Joi.string().optional() // Optional, as it's an ObjectId ref set by backend
});

// Joi schema for updating an existing customer
const updateCustomerSchema = Joi.object({
    name: Joi.string().min(3).messages({
        'string.min': 'Customer name must be at least 3 characters long'
    }),
    email: Joi.string().email().messages({
        'string.email': 'Please provide a valid email address'
    }),
    address: Joi.string().allow(''),
    totalOrders: Joi.number()
        .integer()
        .min(0)
        .messages({
            'number.base': 'Total orders must be a number',
            'number.integer': 'Total orders must be an integer',
            'number.min': 'Total orders cannot be negative'
        }),
    totalReturns: Joi.number()
        .integer()
        .min(0)
        .messages({
            'number.base': 'Total returns must be a number',
            'number.integer': 'Total returns must be an integer',
            'number.min': 'Total returns cannot be negative'
        }),
    totalSpent: Joi.number() // Added totalSpent validation
        .min(0)
        .messages({
            'number.base': 'Total spent must be a number',
            'number.min': 'Total spent cannot be negative'
        }),
    returnRate: Joi.number().min(0).max(100).optional(),
    lastReturnDate: Joi.date().iso().messages({
        'date.iso': 'Last return date must be a valid ISO 8601 date string'
    }),
    riskAnalysis: Joi.string().optional()
}).min(1);

export { createCustomerSchema, updateCustomerSchema };
