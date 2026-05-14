/**
 * Custom error class that includes an HTTP status code.
 * Use this for known/operational errors (e.g., validation failures, not found).
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware.
 * Catches all errors passed via next(err) across the application
 * and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, _next) => {
  // Log the error server-side for debugging
  console.error(`[${new Date().toISOString()}] ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Build consistent error response
  const response = {
    success: false,
    message: err.message || "Internal Server Error"
  };

  // In development, include the stack trace for debugging
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 handler for unknown routes.
 * Place this after all route definitions so unmatched requests
 * get a proper JSON 404 response instead of "Cannot GET /...".
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

module.exports = { AppError, errorHandler, notFoundHandler };
