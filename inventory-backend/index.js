// Entry point of the Inventory Management API.

require('dotenv').config({ quiet: true }); // load .env before anything reads process.env

const express = require('express');
const cors = require('cors');

const inventoryRoutes = require('./routes/inventoryRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Global middleware
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Health check / welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Inventory Management API is running',
    endpoints: '/api/inventory',
  });
});

// API routes
app.use('/api/inventory', inventoryRoutes);

// 404 for unknown routes, then the centralized error handler (must be last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
});
