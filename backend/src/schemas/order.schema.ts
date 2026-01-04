import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID format'),
    reference: z.string().optional(),
    status: z.enum(['DRAFT', 'QUOTED', 'CONFIRMED']).optional(),
    notes: z.string().optional(),
    routeGeometry: z.any().optional(), // GeoJSON or polyline array
    equipmentType: z.string().optional(),
    commodity: z.string().optional(),
    weightLbs: z.number().positive().optional(),
    miles: z.number().positive().optional(),
    flags: z.record(z.boolean()).optional(), // { hazmat: true, weekendPickup: false, etc. }
    stops: z.array(
      z.object({
        sequence: z.number().int().positive('Sequence must be positive'),
        latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
        longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
        plannedTime: z.string().datetime().optional().or(z.date().optional()),
        address: z.string().min(1, 'Address is required'),
        stopType: z.enum(['PICKUP', 'DELIVERY']).optional().default('PICKUP'),
        city: z.string().optional(),
        state: z.string().optional(),
      })
    ).min(1, 'At least one stop is required'),
  }),
});

export const updateStopsSchema = z.object({
  body: z.object({
    stops: z.array(
      z.object({
        sequence: z.number().int().positive('Sequence must be positive'),
        latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
        longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
        plannedTime: z.string().datetime().optional().or(z.date().optional()),
        address: z.string().min(1, 'Address is required'),
        stopType: z.enum(['PICKUP', 'DELIVERY']).optional().default('PICKUP'),
        city: z.string().optional(),
        state: z.string().optional(),
      })
    ).min(1, 'At least one stop is required'),
  }),
});

export const listOrdersQuerySchema = z.object({
  query: z.object({
    query: z.string().optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    sort: z.enum(['newest', 'oldest', 'shortest', 'longest']).optional().default('newest'),
  }),
});

export const orderParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID format'),
  }),
});

export const customerSearchQuerySchema = z.object({
  query: z.object({
    query: z.string().min(1, 'Search query is required'),
  }),
});

// Combined schema for update stops (needs both params and body)
export const updateStopsWithParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID format'),
  }),
  body: z.object({
    stops: z.array(
      z.object({
        sequence: z.number().int().positive('Sequence must be positive'),
        latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
        longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
        plannedTime: z.string().datetime().optional().or(z.date().optional()),
        address: z.string().min(1, 'Address is required'),
        stopType: z.enum(['PICKUP', 'DELIVERY']).optional().default('PICKUP'),
        city: z.string().optional(),
        state: z.string().optional(),
      })
    ).min(1, 'At least one stop is required'),
  }),
});

