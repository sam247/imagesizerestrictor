import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  // Log the error
  logger.error('Express error handler caught an error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body
  });

  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'An internal server error occurred'
    : err.message;

  res.status(err.status || 500).json({
    error: message,
    requestId: req.id // Useful for correlating logs with requests
  });
}
