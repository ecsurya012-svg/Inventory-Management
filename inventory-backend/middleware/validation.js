// Request validation middleware.
// Validation failures are thrown as AppError (400) and handled by errorHandler.js.

const { AppError } = require('./errorHandler');

const ITEM_FIELDS = ['name', 'category', 'quantity', 'price'];

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// Each rule returns { value } (cleaned) or { error } (message).
const rules = {
  name(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      return { error: 'name must be a non-empty string' };
    }
    if (value.trim().length > 100) {
      return { error: 'name must be at most 100 characters' };
    }
    return { value: value.trim() };
  },

  category(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      return { error: 'category must be a non-empty string' };
    }
    if (value.trim().length > 50) {
      return { error: 'category must be at most 50 characters' };
    }
    return { value: value.trim() };
  },

  quantity(value) {
    if (!Number.isInteger(value) || value < 0) {
      return { error: 'quantity must be a whole number greater than or equal to 0' };
    }
    return { value };
  },

  price(value) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      return { error: 'price must be a number greater than or equal to 0' };
    }
    return { value: Math.round(value * 100) / 100 };
  },
};

// Builds a body validator.
//  - partial = false: every field is required (POST, PUT)
//  - partial = true : fields are optional but at least one is needed (PATCH)
// Only known fields are kept; anything else in the body is ignored.
const buildBodyValidator = ({ partial }) => (req, res, next) => {
  const body = req.body;

  if (!isPlainObject(body)) {
    throw new AppError('Request body must be a JSON object (send Content-Type: application/json)', 400);
  }

  const errors = [];
  const clean = {};

  for (const field of ITEM_FIELDS) {
    if (body[field] === undefined) {
      if (!partial) errors.push(`${field} is required`);
      continue;
    }
    const result = rules[field](body[field]);
    if (result.error) errors.push(result.error);
    else clean[field] = result.value;
  }

  if (partial && errors.length === 0 && Object.keys(clean).length === 0) {
    errors.push(`provide at least one of: ${ITEM_FIELDS.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }

  req.body = clean;
  next();
};

const validateCreate = buildBodyValidator({ partial: false });
const validateReplace = buildBodyValidator({ partial: false });
const validateUpdate = buildBodyValidator({ partial: true });

// Validates the :id route parameter (must be a positive whole number).
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id) || Number(id) < 1 || !Number.isSafeInteger(Number(id))) {
    throw new AppError('id must be a positive whole number', 400);
  }
  next();
};

// Validates query params used by GET /api/inventory.
const validateQuery = (req, res, next) => {
  const { category, search, quantity, minQuantity, maxQuantity } = req.query;
  const errors = [];

  for (const [key, value] of Object.entries({ category, search, quantity, minQuantity, maxQuantity })) {
    if (value !== undefined && typeof value !== 'string') {
      errors.push(`${key} must be provided only once`);
    }
  }

  const checkQuantity = (key, value) => {
    if (typeof value !== 'string') return;
    if (!/^\d+$/.test(value)) errors.push(`${key} must be a whole number greater than or equal to 0`);
  };
  checkQuantity('quantity', quantity);
  checkQuantity('minQuantity', minQuantity);
  checkQuantity('maxQuantity', maxQuantity);

  if (
    errors.length === 0 &&
    minQuantity !== undefined &&
    maxQuantity !== undefined &&
    Number(minQuantity) > Number(maxQuantity)
  ) {
    errors.push('minQuantity cannot be greater than maxQuantity');
  }

  if (errors.length > 0) {
    throw new AppError('Invalid query parameters', 400, errors);
  }
  next();
};

module.exports = { validateCreate, validateReplace, validateUpdate, validateId, validateQuery };
