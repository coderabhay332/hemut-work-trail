/**
 * Data Transfer Objects for Order API responses
 * All business logic and derived fields computed here
 */

import { Order, Stop, Customer } from '@prisma/client';

export interface OrderListItemDTO {
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
  stopsSummary: { pickups: number; deliveries: number };
  createdAt: string;
}

export interface OrderDetailDTO {
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
  flags: {
    hazmat: boolean;
    weekendPickup: boolean;
    weekendDelivery: boolean;
    [key: string]: boolean;
  };
  createdAt: string;
  stops: Array<{
    id: string;
    sequence: number;
    latitude: number;
    longitude: number;
    plannedTime: string | null;
    address: string;
    city: string | null;
    state: string | null;
    stopType: string;
  }>;
}

/**
 * Parse city and state from address string
 */
function parseAddress(address: string): { city: string | null; state: string | null } {
  // Common pattern: "Street, City, State ZIP" or "City, State"
  const parts = address.split(',').map((p) => p.trim());
  
  if (parts.length >= 2) {
    const statePart = parts[parts.length - 1];
    // Extract state (2-3 letter code, may have ZIP after)
    const stateMatch = statePart.match(/^([A-Z]{2,3})/);
    const state = stateMatch ? stateMatch[1] : null;
    
    // City is usually second to last part
    const city = parts.length >= 2 ? parts[parts.length - 2] : null;
    
    return { city, state };
  }
  
  return { city: null, state: null };
}

/**
 * Compute derived fields for order list item
 */
export function toOrderListItemDTO(
  order: Order & { customer: Customer; stops: Stop[] }
): OrderListItemDTO {
  const sortedStops = [...order.stops].sort((a, b) => a.sequence - b.sequence);
  
  // Origin from first stop
  const firstStop = sortedStops[0];
  const origin = firstStop
    ? {
        city: (firstStop as any).city || parseAddress(firstStop.address).city || 'Unknown',
        state: (firstStop as any).state || parseAddress(firstStop.address).state || 'Unknown',
      }
    : null;
  
  // Destination from last stop
  const lastStop = sortedStops[sortedStops.length - 1];
  const destination = lastStop
    ? {
        city: (lastStop as any).city || parseAddress(lastStop.address).city || 'Unknown',
        state: (lastStop as any).state || parseAddress(lastStop.address).state || 'Unknown',
      }
    : null;
  
  // Pickup date from first pickup stop
  // Handle both old data (no stopType) and new data (with stopType)
  const firstPickup = sortedStops.find((s) => (s as any).stopType === 'PICKUP' || !(s as any).stopType);
  const pickupDate = firstPickup?.plannedTime
    ? new Date(firstPickup.plannedTime).toISOString()
    : null;
  
  // Delivery date from last delivery stop
  const lastDelivery = [...sortedStops]
    .reverse()
    .find((s) => (s as any).stopType === 'DELIVERY');
  const deliveryDate = lastDelivery?.plannedTime
    ? new Date(lastDelivery.plannedTime).toISOString()
    : null;
  
  // Stops summary - handle missing stopType field
  const pickups = sortedStops.filter((s) => {
    const stopType = (s as any).stopType;
    return stopType === 'PICKUP' || !stopType; // Default to PICKUP if not set
  }).length;
  const deliveries = sortedStops.filter((s) => (s as any).stopType === 'DELIVERY').length;
  
  return {
    id: order.id,
    reference: order.reference || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    customerName: order.customer.name,
    origin,
    destination,
    pickupDate,
    deliveryDate,
    equipmentType: order.equipmentType || 'Not Specified',
    commodity: order.commodity || 'General Freight',
    weightLbs: order.weightLbs,
    miles: order.miles,
    stopsSummary: { pickups, deliveries },
    createdAt: order.createdAt.toISOString(),
  };
}

/**
 * Transform order to detail DTO
 */
export function toOrderDetailDTO(
  order: Order & { customer: Customer; stops: Stop[] }
): OrderDetailDTO {
  const sortedStops = [...order.stops].sort((a, b) => a.sequence - b.sequence);
  
  // Parse flags with defaults
  const flags = (order.flags as any) || {};
  const defaultFlags = {
    hazmat: false,
    weekendPickup: false,
    weekendDelivery: false,
  };
  
  // Check for weekend pickup/delivery based on planned times
  if (sortedStops.length > 0) {
    const firstPickup = sortedStops.find((s) => (s as any).stopType === 'PICKUP' || !(s as any).stopType);
    if (firstPickup?.plannedTime) {
      const day = new Date(firstPickup.plannedTime).getDay();
      defaultFlags.weekendPickup = day === 0 || day === 6;
    }
    
    const lastDelivery = [...sortedStops].reverse().find((s) => (s as any).stopType === 'DELIVERY');
    if (lastDelivery?.plannedTime) {
      const day = new Date(lastDelivery.plannedTime).getDay();
      defaultFlags.weekendDelivery = day === 0 || day === 6;
    }
  }
  
  const mergedFlags = { ...defaultFlags, ...flags };
  
  return {
    id: order.id,
    reference: order.reference || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    customerId: order.customerId,
    customerName: order.customer.name,
    status: order.status,
    notes: order.notes,
    routeGeometry: order.routeGeometry,
    equipmentType: order.equipmentType,
    commodity: order.commodity,
    weightLbs: order.weightLbs,
    miles: order.miles,
    flags: mergedFlags,
    createdAt: order.createdAt.toISOString(),
    stops: sortedStops.map((stop) => ({
      id: stop.id,
      sequence: stop.sequence,
      latitude: stop.latitude,
      longitude: stop.longitude,
      plannedTime: stop.plannedTime ? stop.plannedTime.toISOString() : null,
      address: stop.address,
      city: (stop as any).city || null,
      state: (stop as any).state || null,
      stopType: (stop as any).stopType || 'PICKUP',
    })),
  };
}

