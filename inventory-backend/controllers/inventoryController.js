// Business logic for the inventory API (CRUD + filtering + searching).
// Validation has already happened in middleware/validation.js by the time these run.
// Errors are thrown as AppError and picked up by middleware/errorHandler.js.

const Inventory = require('../model/inventoryData');
const { AppError } = require('../middleware/errorHandler');

// GET /api/inventory
// Optional query params: category, search, quantity, minQuantity, maxQuantity
const getAllItems = (req, res) => {
  const { category, search, quantity, minQuantity, maxQuantity } = req.query;

  let items = [...Inventory.getAll()];
  const filters = {};

  if (category !== undefined) {
    const wanted = category.trim().toLowerCase();
    items = items.filter((item) => item.category.toLowerCase() === wanted);
    filters.category = category;
  }

  if (search !== undefined) {
    const term = search.trim().toLowerCase();
    items = items.filter((item) => item.name.toLowerCase().includes(term));
    filters.search = search;
  }

  if (quantity !== undefined) {
    items = items.filter((item) => item.quantity === Number(quantity));
    filters.quantity = Number(quantity);
  }

  if (minQuantity !== undefined) {
    items = items.filter((item) => item.quantity >= Number(minQuantity));
    filters.minQuantity = Number(minQuantity);
  }

  if (maxQuantity !== undefined) {
    items = items.filter((item) => item.quantity <= Number(maxQuantity));
    filters.maxQuantity = Number(maxQuantity);
  }

  res.status(200).json({
    success: true,
    count: items.length,
    filters,
    data: items,
  });
};

// GET /api/inventory/:id
const getItemById = (req, res) => {
  const item = Inventory.getById(Number(req.params.id));
  if (!item) {
    throw new AppError(`Item with id ${req.params.id} not found`, 404);
  }

  res.status(200).json({ success: true, data: item });
};

// POST /api/inventory
const createItem = (req, res) => {
  const { name, category } = req.body;

  if (Inventory.findDuplicate(name, category)) {
    throw new AppError(`Item "${name}" already exists in category "${category}"`, 409);
  }

  const item = Inventory.add(req.body);
  res.status(201).json({ success: true, message: 'Item created successfully', data: item });
};

// PUT /api/inventory/:id   (full update - all fields required)
// PATCH /api/inventory/:id (partial update - any fields)
const updateItem = (req, res) => {
  const id = Number(req.params.id);

  const existing = Inventory.getById(id);
  if (!existing) {
    throw new AppError(`Item with id ${req.params.id} not found`, 404);
  }

  // Check for duplicates against what the item will look like after the update.
  const merged = { ...existing, ...req.body };
  if (Inventory.findDuplicate(merged.name, merged.category, id)) {
    throw new AppError(`Item "${merged.name}" already exists in category "${merged.category}"`, 409);
  }

  const updated = Inventory.update(id, req.body);
  res.status(200).json({ success: true, message: 'Item updated successfully', data: updated });
};

// DELETE /api/inventory/:id
const deleteItem = (req, res) => {
  const removed = Inventory.remove(Number(req.params.id));
  if (!removed) {
    throw new AppError(`Item with id ${req.params.id} not found`, 404);
  }

  res.status(200).json({ success: true, message: 'Item deleted successfully', data: removed });
};

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem };
