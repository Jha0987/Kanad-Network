import config from '../config/env.js';
import logger from '../utils/logger.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const errorHandler = (err, req, res, _next) => {
  logger.error('Error occurred:', err);

  if (err.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message,
      errorCode: 'VALIDATION_ERROR'
    });
  }

  if (err.code === 11000) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'Duplicate key error',
      errorCode: 'DUPLICATE_KEY'
    });
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  const response = {
    success: false,
    message,
    errorCode: err.errorCode || 'SERVER_ERROR'
  };

  if (config.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export const notFound = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errorCode: 'NOT_FOUND_404'
  });
};
