// In-memory data store for the inventory.
// Data lives in a plain array in runtime memory only (no files, no database),
// so it resets every time the server restarts.

const now = () => new Date().toISOString();

// Seed data so the API has something to filter/search right away.
let inventory = [
  { id: 1, name: 'Wireless Mouse', category: 'Electronics', quantity: 45, price: 799, createdAt: now(), updatedAt: now() },
  { id: 2, name: 'USB-C Cable', category: 'Electronics', quantity: 120, price: 299, createdAt: now(), updatedAt: now() },
  { id: 3, name: 'A4 Notebook', category: 'Stationery', quantity: 200, price: 60, createdAt: now(), updatedAt: now() },
  { id: 4, name: 'Ball Pen Pack', category: 'Stationery', quantity: 8, price: 120, createdAt: now(), updatedAt: now() },
  { id: 5, name: 'Office Chair', category: 'Furniture', quantity: 12, price: 4500, createdAt: now(), updatedAt: now() },
  { id: 6, name: 'Desk Lamp', category: 'Furniture', quantity: 0, price: 1299, createdAt: now(), updatedAt: now() },
];

// Auto-increment id counter (ids are never reused after a delete).
let nextId = inventory.length + 1;

const norm = (text) => String(text).trim().toLowerCase();

// Return every item.
const getAll = () => inventory;

// Return one item by id, or null when it does not exist.
const getById = (id) => inventory.find((item) => item.id === id) || null;

// Find an item with the same name + category (case-insensitive).
// `excludeId` lets an item be updated without clashing with itself.
const findDuplicate = (name, category, excludeId = null) =>
  inventory.find(
    (item) =>
      item.id !== excludeId &&
      norm(item.name) === norm(name) &&
      norm(item.category) === norm(category)
  ) || null;

// Add a new item to the array and return it.
const add = ({ name, category, quantity, price }) => {
  const timestamp = now();
  const item = { id: nextId++, name, category, quantity, price, createdAt: timestamp, updatedAt: timestamp };
  inventory.push(item);
  return item;
};

// Update an item in place. Returns the updated item, or null if the id is unknown.
const update = (id, changes) => {
  const index = inventory.findIndex((item) => item.id === id);
  if (index === -1) return null;

  inventory[index] = {
    ...inventory[index],
    ...changes,
    id, // the id can never be changed
    updatedAt: now(),
  };
  return inventory[index];
};

// Remove an item from the array. Returns the removed item, or null if the id is unknown.
const remove = (id) => {
  const index = inventory.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const [removed] = inventory.splice(index, 1);
  return removed;
};

module.exports = { getAll, getById, findDuplicate, add, update, remove };
