import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/winston.js';

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    logger.error(`${err.statusCode} - ${err.message} - ${req.url}`);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
  logger.error(`500 - ${err.message} - ${req.url}`);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorMiddleware;