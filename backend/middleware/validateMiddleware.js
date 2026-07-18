import { ApiError } from '../utils/ApiError.js'; // Import your custom ApiError
import { asyncHandler } from '../utils/asyncHandler.js'; // Import your asyncHandler

const validate = (schema, source = 'body') => asyncHandler(async (req, res, next) => {
    let dataToValidate;

    switch (source) {
        case 'body':
            dataToValidate = req.body;
            break;
        case 'params':
            dataToValidate = req.params;
            break;
        case 'query':
            dataToValidate = req.query;
            break;
        default:
            throw new ApiError(500, 'Invalid validation source specified');
    }

    const { error } = schema.validate(dataToValidate, {
        abortEarly: false, 
        allowUnknown: true 
    });

    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'), 
            message: detail.message.replace(/['"]/g, '') 
        }));
        throw new ApiError(400, 'Validation failed', errors);
    }

    next(); 
});

export default validate;
