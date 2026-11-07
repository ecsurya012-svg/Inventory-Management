// Inventory API endpoints. Mounted at /api/inventory in index.js.

const express = require('express');
const controller = require('../controllers/inventoryController');
const {
  validateCreate,
  validateReplace,
  validateUpdate,
  validateId,
  validateQuery,
} = require('../middleware/validation');

const router = express.Router();

router.get('/', validateQuery, controller.getAllItems);
router.get('/:id', validateId, controller.getItemById);
router.post('/', validateCreate, controller.createItem);
router.put('/:id', validateId, validateReplace, controller.updateItem);
router.patch('/:id', validateId, validateUpdate, controller.updateItem);
router.delete('/:id', validateId, controller.deleteItem);

module.exports = router;
