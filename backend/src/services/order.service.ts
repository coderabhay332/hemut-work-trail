import prisma from '../prisma/client';
import { calculateRouteGeometry } from './route.service';
import { Prisma } from '@prisma/client';
import { toOrderListItemDTO, toOrderDetailDTO } from '../dto/order.dto';

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
  async createOrder(input: CreateOrderInput): Promise<{ id: string }> {
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

    return result;
  }

  /**
   * List orders with pagination and search
   * Returns frontend-ready data with computed derived fields
   */
  async listOrders(query?: string, page: number = 1, limit: number = 10) {
    // Ensure page and limit are integers
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;

    const where = query
      ? {
          OR: [
            { id: { contains: query, mode: 'insensitive' as const } },
            { reference: { contains: query, mode: 'insensitive' as const } },
            { customer: { name: { contains: query, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
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

    return {
      data,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    };
  }

  /**
   * Get order details with stops ordered by sequence
   * Returns frontend-ready data with all computed fields
   */
  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
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
    return toOrderDetailDTO(order);
  }

  /**
   * Update stops for an order
   * Recalculates route geometry
   */
  async updateStops(orderId: string, input: UpdateStopsInput): Promise<void> {
    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Calculate new route geometry
    const routeGeometry = calculateRouteGeometry(input.stops);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete existing stops
      await tx.stop.deleteMany({
        where: { orderId },
      });

      // Create new stops
      await tx.stop.createMany({
        data: input.stops.map((stop) => ({
          orderId,
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
        where: { id: orderId },
        data: {
          routeGeometry,
        },
      });
    });
  }
}

export const orderService = new OrderService();

