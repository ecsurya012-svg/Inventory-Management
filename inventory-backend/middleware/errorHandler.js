// Centralized error handling.
// Every error in the app ends up here, so every failure has the same JSON shape:
// { success: false, message: "...", errors?: [...] }

// Custom error carrying an HTTP status code (and optional list of details).
class AppError extends Error {
  constructor(message, statusCode = 500, errors = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Runs when no route matched the request.
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// Express recognises this as an error handler because it takes four arguments.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Malformed JSON in the request body (thrown by express.json()).
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // Request body too large.
  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large';
  }

  // Never leak internal details for unexpected server errors.
  if (statusCode >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal Server Error';
    }
  }

  const body = { success: false, message };
  if (err.errors && err.errors.length > 0) body.errors = err.errors;
  if (statusCode >= 500 && process.env.NODE_ENV !== 'production') body.stack = err.stack;

  res.status(statusCode).json(body);
};

module.exports = { AppError, notFound, errorHandler };
