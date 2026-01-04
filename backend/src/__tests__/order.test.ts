import { PrismaClient } from '@prisma/client';
import { orderService } from '../services/order.service';
import prisma from '../prisma/client';

describe('Order Service', () => {
  let testCustomerId: string;
  let testOrderId: string;

  beforeAll(async () => {
    // Create a test customer
    const customer = await prisma.customer.create({
      data: {
        name: 'Test Customer',
        email: 'test@example.com',
      },
    });
    testCustomerId = customer.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.order.deleteMany({ where: { customerId: testCustomerId } });
    await prisma.customer.delete({ where: { id: testCustomerId } });
    await prisma.$disconnect();
  });

  describe('createOrder', () => {
    it('should create an order with stops in a transaction (happy path)', async () => {
      const input = {
        customerId: testCustomerId,
        status: 'DRAFT' as const,
        notes: 'Test order',
        stops: [
          {
            sequence: 1,
            latitude: 40.7128,
            longitude: -74.006,
            address: '123 Test St, New York, NY',
            plannedTime: new Date('2024-01-15T09:00:00Z'),
          },
          {
            sequence: 2,
            latitude: 40.7589,
            longitude: -73.9851,
            address: '456 Test Ave, New York, NY',
            plannedTime: new Date('2024-01-15T10:00:00Z'),
          },
        ],
      };

      const result = await orderService.createOrder(input);

      expect(result.id).toBeDefined();
      testOrderId = result.id;

      // Verify order was created
      const order = await prisma.order.findUnique({
        where: { id: result.id },
      });

      expect(order).toBeDefined();
      expect(order?.customerId).toBe(testCustomerId);
      expect(order?.status).toBe('DRAFT');
      expect(order?.notes).toBe('Test order');
      expect(order?.routeGeometry).toBeDefined();

      // Verify stops were created
      const stops = await prisma.stop.findMany({
        where: { orderId: result.id },
        orderBy: { sequence: 'asc' },
      });

      expect(stops).toHaveLength(2);
      expect(stops[0].sequence).toBe(1);
      expect(stops[1].sequence).toBe(2);
    });
  });

  describe('getOrderById', () => {
    it('should return order details with stops ordered by sequence', async () => {
      const order = await orderService.getOrderById(testOrderId);

      expect(order).toBeDefined();
      expect(order?.id).toBe(testOrderId);
      expect(order?.stops).toBeDefined();
      expect(order?.stops.length).toBeGreaterThan(0);

      // Verify stops are ordered by sequence
      const sequences = order!.stops.map((s) => s.sequence);
      const sortedSequences = [...sequences].sort((a, b) => a - b);
      expect(sequences).toEqual(sortedSequences);

      // Verify first stop has sequence 1
      expect(order!.stops[0].sequence).toBe(1);
    });

    it('should return null for non-existent order', async () => {
      const order = await orderService.getOrderById('00000000-0000-0000-0000-000000000000');
      expect(order).toBeNull();
    });
  });

  describe('stop ordering correctness', () => {
    it('should maintain correct stop sequencing after update', async () => {
      // Create an order with stops
      const createResult = await orderService.createOrder({
        customerId: testCustomerId,
        stops: [
          {
            sequence: 1,
            latitude: 40.7128,
            longitude: -74.006,
            address: 'Stop 1',
          },
          {
            sequence: 3,
            latitude: 40.7589,
            longitude: -73.9851,
            address: 'Stop 3',
          },
          {
            sequence: 2,
            latitude: 40.7505,
            longitude: -73.9934,
            address: 'Stop 2',
          },
        ],
      });

      // Get order and verify stops are ordered by sequence
      const order = await orderService.getOrderById(createResult.id);
      expect(order?.stops).toHaveLength(3);
      expect(order?.stops[0].sequence).toBe(1);
      expect(order?.stops[1].sequence).toBe(2);
      expect(order?.stops[2].sequence).toBe(3);
      expect(order?.stops[0].address).toBe('Stop 1');
      expect(order?.stops[1].address).toBe('Stop 2');
      expect(order?.stops[2].address).toBe('Stop 3');

      // Update stops with new sequence
      await orderService.updateStops(createResult.id, {
        stops: [
          {
            sequence: 2,
            latitude: 40.7589,
            longitude: -73.9851,
            address: 'New Stop 2',
          },
          {
            sequence: 1,
            latitude: 40.7128,
            longitude: -74.006,
            address: 'New Stop 1',
          },
        ],
      });

      // Verify stops are still ordered correctly
      const updatedOrder = await orderService.getOrderById(createResult.id);
      expect(updatedOrder?.stops).toHaveLength(2);
      expect(updatedOrder?.stops[0].sequence).toBe(1);
      expect(updatedOrder?.stops[1].sequence).toBe(2);
      expect(updatedOrder?.stops[0].address).toBe('New Stop 1');
      expect(updatedOrder?.stops[1].address).toBe('New Stop 2');

      // Cleanup
      await prisma.order.delete({ where: { id: createResult.id } });
    });
  });
});

