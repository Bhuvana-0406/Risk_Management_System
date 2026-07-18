
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken; 
    if (!token) {
        throw new ApiError(401, 'Unauthorized request: No access token found in cookies');
    }

    try {
     
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = await Admin.findById(decodedToken.id).select('-password -refreshToken');

        if (!req.user) {
            throw new ApiError(401, 'Invalid access token: User not found');
        }

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, 'Unauthorized request: Access token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(401, 'Unauthorized request: Invalid access token');
        }
        throw new ApiError(500, error.message || 'Server error during access token verification');
    }
});


const authorize = (roles = []) => {
    return (req, res, next) => {
    
        if (typeof roles === 'string') {
            roles = [roles];
        }
        if (!req.user || (roles.length > 0 && !roles.includes(req.user.role))) {
            throw new ApiError(403, `Access denied. Your role (${req.user ? req.user.role : 'none'}) is not authorized for this action.`);
        }
        next(); 
    };
};

export { protect, authorize };