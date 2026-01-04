import prisma from '../prisma/client';
import { calculateRouteGeometry } from './route.service';
import { Prisma } from '@prisma/client';
import { toOrderListItemDTO, toOrderDetailDTO } from '../dto/order.dto';
import { cacheService } from './cache.service';

type OrderStatus = 'DRAFT' | 'QUOTED' | 'CONFIRMED';

export interface CreateOrderInput {
  customerId: string;
  reference?: string;
  status?: OrderStatus;
  notes?: string;
  routeGeometry?: any;
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
    plannedTime?: Date | string;
    address: string;
    stopType?: string;
    city?: string;
    state?: string;
  }>;
}

export interface UpdateStopsInput {
  stops: Array<{
    sequence: number;
    latitude: number;
    longitude: number;
    plannedTime?: Date | string;
    address: string;
    stopType?: string;
    city?: string;
    state?: string;
  }>;
}

export class OrderService {
  /**
   * Create order with stops in a transaction
   */
  async createOrder(input: CreateOrderInput): Promise<{ id: number }> {
    // Calculate route geometry from stops
    const routeGeometry = input.routeGeometry || calculateRouteGeometry(input.stops);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create order
      const order = await tx.order.create({
        data: {
          customerId: input.customerId,
          reference: input.reference,
          status: input.status || 'DRAFT',
          notes: input.notes,
          routeGeometry: routeGeometry,
          equipmentType: input.equipmentType,
          commodity: input.commodity,
          weightLbs: input.weightLbs,
          miles: input.miles,
          rate: input.rate,
          flags: input.flags,
        },
      });

      // Create stops
      await tx.stop.createMany({
        data: input.stops.map((stop) => ({
          orderId: order.id,
          sequence: stop.sequence,
          latitude: stop.latitude,
          longitude: stop.longitude,
          plannedTime: stop.plannedTime ? new Date(stop.plannedTime) : null,
          address: stop.address,
          stopType: (stop.stopType as any) || 'PICKUP',
          city: stop.city,
          state: stop.state,
        })),
      });

      return { id: order.id };
    });

    // Invalidate orders list cache and counts cache
    if (cacheService.isAvailable()) {
      await cacheService.invalidateOrdersList();
      await cacheService.del('orders:counts');
    }

    return result;
  }

  /**
   * List orders with pagination and search
   * Returns frontend-ready data with computed derived fields
   */
  async listOrders(query?: string, page: number = 1, limit: number = 10, sort: string = 'newest') {
    // Ensure page and limit are integers
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;

    // Normalize sort value to handle undefined or invalid values
    const normalizedSort = (sort || 'newest').toLowerCase();
    
    // Build cache key including sort (normalize it)
    const cacheKey = `orders:list:${query || 'all'}:${pageNum}:${limitNum}:${normalizedSort}`;

    // Try to get from cache
    if (cacheService.isAvailable()) {
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Build search query - handle integer ID separately
    const where = query
      ? (() => {
          const searchConditions: any[] = [
            { reference: { contains: query, mode: 'insensitive' as const } },
            { customer: { name: { contains: query, mode: 'insensitive' as const } } },
          ];
          
          // If query is a number, also search by exact ID match
          const queryAsNumber = parseInt(query, 10);
          if (!isNaN(queryAsNumber)) {
            searchConditions.push({ id: queryAsNumber });
          }
          
          return { OR: searchConditions };
        })()
      : {};

    // Determine orderBy based on sort parameter
    let orderBy: any;
    
    console.log('Sort parameter received:', sort, 'Normalized:', normalizedSort);
    
    switch (normalizedSort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'shortest':
        // Sort by miles ascending (nulls will be sorted last by Prisma)
        orderBy = { miles: 'asc' };
        break;
      case 'longest':
        // Sort by miles descending (nulls will be sorted first by Prisma, so we need to handle this)
        // For longest, we want non-null values first, so desc is correct
        orderBy = { miles: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }
    
    console.log('OrderBy applied:', JSON.stringify(orderBy));

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stops: {
            orderBy: {
              sequence: 'asc',
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Transform to frontend-ready DTOs
    const data = orders.map(toOrderListItemDTO);

    const result = {
      data,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    };

    // Cache for 5 minutes (300 seconds)
    if (cacheService.isAvailable()) {
      await cacheService.set(cacheKey, result, 300);
    }

    return result;
  }

  /**
   * Get order counts (inbound = total orders, outbound = total delivery stops)
   */
  async getOrderCounts() {
    const cacheKey = 'orders:counts';

    // Try to get from cache
    if (cacheService.isAvailable()) {
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const [totalOrders, deliveryStops] = await Promise.all([
      prisma.order.count(),
      prisma.stop.count({
        where: {
          stopType: 'DELIVERY',
        },
      }),
    ]);

    const result = {
      inbound: totalOrders,
      outbound: deliveryStops,
    };

    // Cache for 1 minute (60 seconds)
    if (cacheService.isAvailable()) {
      await cacheService.set(cacheKey, result, 60);
    }

    return result;
  }

  /**
   * Get order details with stops ordered by sequence
   * Returns frontend-ready data with all computed fields
   */
  async getOrderById(id: string | number) {
    // Convert string ID to number if needed
    const orderId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(orderId)) {
      return null;
    }

    const cacheKey = `order:${orderId}`;

    // Try to get from cache
    if (cacheService.isAvailable()) {
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        stops: {
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    // Transform to frontend-ready DTO
    const result = toOrderDetailDTO(order);

    // Cache for 10 minutes (600 seconds)
    if (cacheService.isAvailable()) {
      await cacheService.set(cacheKey, result, 600);
    }

    return result;
  }

  /**
   * Update order rate
   */
  async updateOrderRate(orderId: string | number, rate: number): Promise<void> {
    // Convert string ID to number if needed
    const id = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
    if (isNaN(id)) {
      throw new Error('Invalid order ID');
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update rate
    await prisma.order.update({
      where: { id },
      data: { rate },
    });

    // Invalidate cache for this order and orders list
    if (cacheService.isAvailable()) {
      await cacheService.invalidateOrder(String(id));
      await cacheService.invalidateOrdersList();
    }
  }

  /**
   * Update stops for an order
   * Recalculates route geometry
   */
  async updateStops(orderId: string | number, input: UpdateStopsInput): Promise<void> {
    // Convert string ID to number if needed
    const id = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
    if (isNaN(id)) {
      throw new Error('Invalid order ID');
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Calculate new route geometry
    const routeGeometry = calculateRouteGeometry(input.stops);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete existing stops
      await tx.stop.deleteMany({
        where: { orderId: id },
      });

      // Create new stops
      await tx.stop.createMany({
        data: input.stops.map((stop) => ({
          orderId: id,
          sequence: stop.sequence,
          latitude: stop.latitude,
          longitude: stop.longitude,
          plannedTime: stop.plannedTime ? new Date(stop.plannedTime) : null,
          address: stop.address,
          stopType: (stop as any).stopType || 'PICKUP',
          city: (stop as any).city,
          state: (stop as any).state,
        })),
      });

      // Update order with new route geometry
      await tx.order.update({
        where: { id },
        data: {
          routeGeometry,
        },
      });
    });

    // Invalidate cache for this order, orders list, and counts (stops changed)
    if (cacheService.isAvailable()) {
      await cacheService.invalidateOrder(String(id));
      await cacheService.del('orders:counts');
    }
  }
}

export const orderService = new OrderService();

