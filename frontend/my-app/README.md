# Freight Marketplace Frontend

React + TypeScript frontend for the Freight Marketplace application. This frontend consumes backend APIs and renders data exactly as provided - no business logic or derived calculations are performed in the frontend.

## Architecture

**Key Principle:** All data displayed in the UI comes from backend APIs. The frontend only renders what the backend provides.

### Component Structure

```
src/
├── components/
│   ├── OrdersList.tsx              # Left panel - list of orders with pagination
│   ├── OrderDetails.tsx            # Right panel - order details with tabs
│   ├── CreateOrderModal.tsx        # Modal for creating new orders
│   └── OrderDetailsTabs/
│       ├── LoadDetailsTab.tsx      # Load/pickup/delivery details
│       ├── CustomerDetailsTab.tsx  # Customer contact and billing info
│       ├── LaneHistoryTab.tsx      # Lane history (placeholder)
│       └── CalculatorTab.tsx       # Quote calculator
├── lib/
│   └── api.ts                      # Typed API client
└── types/
    └── api.ts                      # TypeScript types matching backend DTOs
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API URL:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Ensure backend is running:**
   The frontend expects the backend API to be running on `http://localhost:3000` (or the URL specified in `.env.local`).

## Features

### Main Page
- **Left Panel:** Orders list with search, pagination, and selection
- **Right Panel:** Order details with tabs (Load Details, Customer Details, Lane History, Calculator)
- **Header:** Status indicators, navigation tabs, search bar, and action buttons

### Order Details Tabs
1. **Load Details:** Displays pickup/delivery locations, load information (weight, miles, equipment type, flags, etc.)
2. **Customer Details:** Shows primary contact, billing info, and customer metrics
3. **Lane History:** Placeholder (backend doesn't provide this data yet)
4. **Calculator:** Quote calculator with base cost, accessorials, and margin

### Create Order Modal
- Customer selection
- Equipment type
- Multiple stops (pickup/delivery)
- Address, city, state, ZIP
- Scheduled arrival times

## API Integration

All API calls go through the typed `apiClient` in `src/lib/api.ts`:

- `GET /orders` - List orders with pagination
- `GET /orders/:id` - Get order details
- `GET /customers/:id` - Get customer details
- `GET /customers?query=` - Search customers
- `POST /orders` - Create new order

## Data Flow

1. **User interacts with UI** (clicks, searches, etc.)
2. **Component calls API client** (`apiClient.getOrders()`, etc.)
3. **API client fetches from backend** (using fetch)
4. **Backend returns frontend-ready data** (all derived fields computed)
5. **Component renders data** (no calculations, just display)

## Important Notes

- **No Business Logic:** The frontend does NOT compute:
  - Origin/destination from stops
  - Pickup/delivery dates
  - Stop summaries
  - Weekend flags
  - Any derived fields

- **Backend Provides Everything:** All displayed data comes directly from backend API responses

- **Type Safety:** TypeScript types ensure frontend matches backend contracts exactly

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## Design Philosophy

This frontend was built using the provided screenshots as **behavioral references only**. The focus was on:

1. ✅ Correct component structure
2. ✅ Correct data binding from backend
3. ✅ Matching user flows and behavior
4. ✅ Functional correctness over visual perfection

**Note:** I used the provided screenshots purely as a behavioral reference and focused on implementing correct data contracts and flows. All data displayed comes from backend APIs with no frontend business logic.
