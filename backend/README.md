# Freight Marketplace Backend API

Production-ready REST API for a freight marketplace/quoting system built with clean architecture, strong validation, and comprehensive testing.

## 🛠 Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis (ioredis)
- **Validation**: Zod
- **Testing**: Jest

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher) - Optional but recommended for caching
- npm or yarn

## 🚀 Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb freight_marketplace
```

Or using psql:

```sql
CREATE DATABASE freight_marketplace;
```

### 3. Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/freight_marketplace?schema=public"
PORT=3000
NODE_ENV=development

# Redis (Optional - for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
```

Replace `user` and `password` with your PostgreSQL credentials.

**Note:** Redis is optional. If Redis is not available, the application will work without caching but will be slower for frequent data access.

### 4. Database Migrations

Generate Prisma Client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed Database

Populate the database with sample data:

```bash
npm run prisma:seed
```

This creates:
- 5 customers
- 3 orders (with 2-4 stops each)

## 🏃 Running the Server

### Development Mode (with hot reload)

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env`).

## 📡 API Endpoints

### Health Check

```http
GET /health
```

### 1. Create Order

Creates a new order with multiple stops in a single transaction.

```http
POST /orders
Content-Type: application/json

{
  "customerId": "uuid-here",
  "status": "DRAFT",  // Optional: DRAFT | QUOTED | CONFIRMED
  "notes": "Optional notes",
  "routeGeometry": null,  // Optional: auto-calculated if not provided
  "stops": [
    {
      "sequence": 1,
      "latitude": 40.7128,
      "longitude": -74.006,
      "address": "123 Main St, New York, NY",
      "plannedTime": "2024-01-15T09:00:00Z"  // Optional
    },
    {
      "sequence": 2,
      "latitude": 40.7589,
      "longitude": -73.9851,
      "address": "456 Broadway, New York, NY",
      "plannedTime": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "id": "order-uuid"
}
```

### 2. List Orders

List orders with pagination and search capabilities.

```http
GET /orders?query=acme&page=1&limit=10
```

**Query Parameters:**
- `query` (optional): Search by customer name or order ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "customerId": "uuid",
      "status": "QUOTED",
      "notes": "...",
      "routeGeometry": [...],
      "createdAt": "2024-01-15T00:00:00Z",
      "customer": {
        "id": "uuid",
        "name": "Acme Logistics",
        "email": "contact@acme.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 3. Get Order Details

Retrieves order details including all stops (ordered by sequence) and route geometry.

```http
GET /orders/:id
```

**Response:**
```json
{
  "id": "uuid",
  "customerId": "uuid",
  "status": "QUOTED",
  "notes": "...",
  "routeGeometry": [[40.7128, -74.006], [40.7589, -73.9851]],
  "createdAt": "2024-01-15T00:00:00Z",
  "customer": {
    "id": "uuid",
    "name": "Acme Logistics",
    "email": "contact@acme.com"
  },
  "stops": [
    {
      "id": "uuid",
      "orderId": "uuid",
      "sequence": 1,
      "latitude": 40.7128,
      "longitude": -74.006,
      "plannedTime": "2024-01-15T09:00:00Z",
      "address": "123 Main St, New York, NY"
    },
    {
      "id": "uuid",
      "orderId": "uuid",
      "sequence": 2,
      "latitude": 40.7589,
      "longitude": -73.9851,
      "plannedTime": "2024-01-15T10:30:00Z",
      "address": "456 Broadway, New York, NY"
    }
  ]
}
```

### 4. Update Order Stops

Replace all stops for an order. Recalculates route geometry automatically.

```http
POST /orders/:id/stops
PUT  /orders/:id/stops
Content-Type: application/json

{
  "stops": [
    {
      "sequence": 1,
      "latitude": 40.7128,
      "longitude": -74.006,
      "address": "New Address 1",
      "plannedTime": "2024-01-15T09:00:00Z"
    },
    {
      "sequence": 2,
      "latitude": 40.7589,
      "longitude": -73.9851,
      "address": "New Address 2"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Stops updated successfully"
}
```

### 5. Search Customers

Search customers by name or email (case-insensitive, partial match).

```http
GET /customers?query=acme
```

**Query Parameters:**
- `query` (required): Search term

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Acme Logistics",
    "email": "contact@acmelogistics.com",
    "createdAt": "2024-01-15T00:00:00Z"
  }
]
```

**Note:** Results are limited to 10 customers.

## 🧪 Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Test Coverage

Tests cover:
- ✅ Order creation (happy path with transaction)
- ✅ Stop ordering correctness
- ✅ Order details retrieval with ordered stops

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # Server entry point
│   ├── routes/                # API routes
│   │   ├── order.routes.ts
│   │   └── customer.routes.ts
│   ├── controllers/           # Request handlers (thin layer)
│   │   ├── order.controller.ts
│   │   └── customer.controller.ts
│   ├── services/              # Business logic
│   │   ├── order.service.ts
│   │   ├── customer.service.ts
│   │   └── route.service.ts
│   ├── schemas/               # Zod validation schemas
│   │   └── order.schema.ts
│   ├── middleware/            # Express middleware
│   │   └── validation.middleware.ts
│   ├── prisma/                # Prisma client
│   │   └── client.ts
│   └── __tests__/             # Jest tests
│       └── order.test.ts
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed script
├── jest.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🗄️ Data Model

### Customer
- `id` (UUID)
- `name` (string)
- `email` (optional string)
- `createdAt` (timestamp)

### Order
- `id` (UUID)
- `customerId` (FK to Customer)
- `status` (enum: DRAFT | QUOTED | CONFIRMED)
- `notes` (optional text)
- `routeGeometry` (JSON - polyline array or GeoJSON)
- `createdAt` (timestamp)

### Stop
- `id` (UUID)
- `orderId` (FK to Order)
- `sequence` (integer - order of stops)
- `latitude` (float)
- `longitude` (float)
- `plannedTime` (optional timestamp)
- `address` (string)

**Rules:**
- Stops are always returned ordered by `sequence`
- Database transactions are used when creating/updating orders + stops
- Route geometry is auto-calculated from stops if not provided

## 🛡️ Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Validation errors
- `404` - Resource not found
- `500` - Server errors

Validation errors include detailed messages:

```json
{
  "error": "Validation error",
  "details": [
    {
      "path": "body.stops.0.latitude",
      "message": "Latitude must be between -90 and 90"
    }
  ]
}
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚨 Important Notes

- **No secrets committed**: All sensitive data should be in `.env` file (not committed to git)
- **Transactions**: Order creation and stop updates use database transactions
- **Stop Sequencing**: Stops must have unique, positive sequence numbers
- **Route Geometry**: Automatically calculated from stops if not provided
- **Validation**: All inputs are validated using Zod schemas
- **Caching**: Redis caching is enabled for frequently accessed data:
  - Order lists: 5 minutes TTL
  - Order details: 10 minutes TTL
  - Customer details: 10 minutes TTL
  - Cache is automatically invalidated on data updates
  - Application works without Redis but will be slower

## 📝 Example API Requests

### Create Order

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-uuid-here",
    "status": "DRAFT",
    "notes": "Urgent delivery",
    "stops": [
      {
        "sequence": 1,
        "latitude": 40.7128,
        "longitude": -74.006,
        "address": "123 Main St, New York, NY"
      },
      {
        "sequence": 2,
        "latitude": 40.7589,
        "longitude": -73.9851,
        "address": "456 Broadway, New York, NY"
      }
    ]
  }'
```

### List Orders

```bash
curl "http://localhost:3000/orders?query=acme&page=1&limit=10"
```

### Get Order Details

```bash
curl "http://localhost:3000/orders/order-uuid-here"
```

### Search Customers

```bash
curl "http://localhost:3000/customers?query=acme"
```

## 🎯 Quick Start (Complete Setup)

```bash
# 1. Install dependencies
npm install

# 2. Set up database (create .env file first)
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 3. Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

---


