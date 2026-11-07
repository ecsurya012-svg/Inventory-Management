# Inventory Management System (Backend)

A backend-only **Simple Inventory Management System** built with **Node.js + Express**.
Data is stored in an **in-memory array** (no database, no files), so it resets whenever the server restarts.

Built for **Full Stack Development V8 – Assignment 12**.

## Features

- Full RESTful CRUD for inventory items (create, read one/all, update, delete)
- Filtering by category and quantity (exact, min, max)
- Searching by item name (case-insensitive, partial match)
- Request validation middleware (body, `:id` param and query params)
- Centralized error handler with consistent JSON responses and proper status codes
- Modular structure: routes, controllers, middleware and model are separated
- Configuration through environment variables (`dotenv`)

## Tech Stack

- Node.js, Express 5
- dotenv, cors
- nodemon (dev only)

## Folder Structure

```
inventory-backend/
├── index.js                      # Express server entry point
├── controllers/
│   └── inventoryController.js    # CRUD + filter/search logic
├── routes/
│   └── inventoryRoutes.js        # API endpoints
├── middleware/
│   ├── validation.js             # Input validation
│   └── errorHandler.js           # 404 + centralized error handler
├── model/
│   └── inventoryData.js          # In-memory array store
├── .env                          # Environment variables (not committed)
├── .env.example                  # Sample environment file
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env        # on Windows: copy .env.example .env

# 3. Run in development (auto-restart with nodemon)
npm run dev

# ...or run normally
npm start
```

The server starts at `http://localhost:5000` by default.

### Environment Variables

| Variable   | Default       | Description                                         |
| ---------- | ------------- | --------------------------------------------------- |
| `PORT`     | `5000`        | Port the server listens on                          |
| `NODE_ENV` | `development` | In `production`, error stack traces/details are hidden |

## Item Model

| Field       | Type   | Rules                                      |
| ----------- | ------ | ------------------------------------------ |
| `id`        | number | Auto-generated, never changes              |
| `name`      | string | Required, non-empty, max 100 characters    |
| `category`  | string | Required, non-empty, max 50 characters     |
| `quantity`  | number | Required, whole number, `>= 0`             |
| `price`     | number | Required, `>= 0` (rounded to 2 decimals)   |
| `createdAt` | string | ISO timestamp, set automatically           |
| `updatedAt` | string | ISO timestamp, updated on every change     |

An item is considered a duplicate when another item has the same `name` **and** `category` (case-insensitive) – the API returns `409 Conflict`.

The server starts with 6 seed items so you can try filtering and searching right away.

## API Endpoints

Base URL: `http://localhost:5000/api/inventory`

| Method | Endpoint             | Description                                | Success |
| ------ | -------------------- | ------------------------------------------ | ------- |
| GET    | `/api/inventory`     | Get all items (supports filters + search)  | 200     |
| GET    | `/api/inventory/:id` | Get a single item                          | 200     |
| POST   | `/api/inventory`     | Add a new item                             | 201     |
| PUT    | `/api/inventory/:id` | Replace an item (all fields required)      | 200     |
| PATCH  | `/api/inventory/:id` | Partially update an item (any fields)      | 200     |
| DELETE | `/api/inventory/:id` | Delete an item                             | 200     |

### Query Parameters (GET `/api/inventory`)

| Param         | Example                     | Behaviour                                   |
| ------------- | --------------------------- | ------------------------------------------- |
| `category`    | `?category=electronics`     | Exact category match (case-insensitive)     |
| `search`      | `?search=pen`               | Item name contains the text (case-insensitive) |
| `quantity`    | `?quantity=0`               | Quantity equals the value                   |
| `minQuantity` | `?minQuantity=10`           | Quantity is greater than or equal to value  |
| `maxQuantity` | `?maxQuantity=20`           | Quantity is less than or equal to value     |

Params can be combined, e.g. `?category=Stationery&minQuantity=10&search=note`.

### Examples

**Create an item**

```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","category":"Electronics","quantity":30,"price":1499.5}'
```

```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": 7,
    "name": "Keyboard",
    "category": "Electronics",
    "quantity": 30,
    "price": 1499.5,
    "createdAt": "2026-11-06T05:00:00.000Z",
    "updatedAt": "2026-11-06T05:00:00.000Z"
  }
}
```

**Get all items with filters**

```bash
curl "http://localhost:5000/api/inventory?category=Electronics&minQuantity=50"
```

```json
{
  "success": true,
  "count": 1,
  "filters": { "category": "Electronics", "minQuantity": 50 },
  "data": [ { "id": 2, "name": "USB-C Cable", "...": "..." } ]
}
```

**Partial update**

```bash
curl -X PATCH http://localhost:5000/api/inventory/4 \
  -H "Content-Type: application/json" \
  -d '{"quantity":50}'
```

**Delete**

```bash
curl -X DELETE http://localhost:5000/api/inventory/4
```

## Response Format

Every response is JSON.

Success:

```json
{ "success": true, "message": "...", "data": { } }
```

Error:

```json
{ "success": false, "message": "Validation failed", "errors": ["quantity must be a whole number greater than or equal to 0"] }
```

### Status Codes

| Code | Meaning                                                       |
| ---- | ------------------------------------------------------------- |
| 200  | OK                                                            |
| 201  | Created                                                       |
| 400  | Validation error, invalid `:id`, bad query params or bad JSON |
| 404  | Item or route not found                                       |
| 409  | Duplicate item (same name + category)                         |
| 413  | Request body too large                                        |
| 500  | Unexpected server error                                       |

## How It Works

- **Model** (`model/inventoryData.js`) – holds the `inventory` array and the helpers `getAll`, `getById`, `add`, `update`, `remove` and `findDuplicate`. Each helper checks that the item exists before changing the array.
- **Middleware** (`middleware/validation.js`) – validates request bodies, the `:id` parameter and query params before they reach a controller.
- **Controller** (`controllers/inventoryController.js`) – applies filtering/search and builds the JSON responses.
- **Error handler** (`middleware/errorHandler.js`) – one place that turns every error (validation, not found, bad JSON, unexpected) into a consistent JSON response.

## Notes

- Data is **not persistent**: restarting the server resets the inventory to the seed data.
- No database is used on purpose, as per the assignment requirements.
