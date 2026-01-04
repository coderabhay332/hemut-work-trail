/**
 * TypeScript types matching backend API responses
 * These types ensure frontend receives data exactly as backend provides
 */

// GET /orders response
export interface OrderListItem {
  id: string;
  reference: string;
  customerName: string;
  origin: { city: string; state: string } | null;
  destination: { city: string; state: string } | null;
  pickupDate: string | null;
  deliveryDate: string | null;
  equipmentType: string;
  commodity: string;
  weightLbs: number | null;
  miles: number | null;
  rate: number | null;
  stopsSummary: { pickups: number; deliveries: number };
  createdAt: string;
}

export interface OrdersListResponse {
  data: OrderListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

// GET /orders/:id response
export interface Stop {
  id: string;
  sequence: number;
  latitude: number;
  longitude: number;
  plannedTime: string | null;
  address: string;
  city: string | null;
  state: string | null;
  stopType: string;
}

export interface OrderDetail {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  status: string;
  notes: string | null;
  routeGeometry: any;
  equipmentType: string | null;
  commodity: string | null;
  weightLbs: number | null;
  miles: number | null;
  rate: number | null;
  flags: {
    hazmat: boolean;
    weekendPickup: boolean;
    weekendDelivery: boolean;
    [key: string]: boolean;
  };
  createdAt: string;
  stops: Stop[];
}

// GET /customers/:id response
export interface CustomerDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  primaryContact: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  billingInfo: {
    street: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  metrics: {
    totalOrders: number;
    activeOrders: number;
    totalSpend: number;
    averageOrderValue: number;
  };
  createdAt: string;
}

// POST /orders request
export interface CreateOrderRequest {
  customerId: string;
  reference?: string;
  status?: 'DRAFT' | 'QUOTED' | 'CONFIRMED';
  notes?: string;
  equipmentType?: string;
  commodity?: string;
  weightLbs?: number;
  miles?: number;
  rate?: number;
  flags?: Record<string, boolean>;
  stops: Array<{
    sequence: number;
    latitude: number;
    longitude: number;
    plannedTime?: string;
    address: string;
    stopType?: 'PICKUP' | 'DELIVERY';
    city?: string;
    state?: string;
  }>;
}

// GET /customers?query= response
export interface Customer {
  id: string;
  name: string;
  email: string | null;
  createdAt: string;
}

