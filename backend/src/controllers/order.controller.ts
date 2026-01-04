import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import prisma from '../prisma/client';

export class OrderController {
  /**
   * POST /orders
   * Create order with stops
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const {
        customerId,
        reference,
        status,
        notes,
        routeGeometry,
        equipmentType,
        commodity,
        weightLbs,
        miles,
        flags,
        stops,
      } = req.body;

      // Verify customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }

      // Validate stop sequences are unique and sequential
      const sequences = stops.map((s: any) => s.sequence).sort((a: number, b: number) => a - b);
      const uniqueSequences = new Set(sequences);
      if (uniqueSequences.size !== sequences.length) {
        res.status(400).json({ error: 'Stop sequences must be unique' });
        return;
      }

      const result = await orderService.createOrder({
        customerId,
        reference,
        status,
        notes,
        routeGeometry,
        equipmentType,
        commodity,
        weightLbs,
        miles,
        flags,
        stops,
      });

      res.status(201).json({ id: result.id });
    } catch (error: any) {
      console.error('Error creating order:', error.message);
      res.status(500).json({ error: 'Failed to create order', message: error.message });
    }
  }

  /**
   * GET /orders
   * List orders with pagination and search
   * Returns frontend-ready data with computed derived fields
   */
  async listOrders(req: Request, res: Response): Promise<void> {
    try {
      const { query, page, limit, sort } = req.query as any;
      console.log('Controller received sort:', sort);
      const result = await orderService.listOrders(query, page, limit, sort);
      // Response shape: { data: [...], meta: { page, limit, total } }
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error listing orders:', error.message);
      res.status(500).json({ 
        error: 'Failed to list orders', 
        message: error.message
      });
    }
  }

  /**
   * GET /orders/:id
   * Get order details with stops
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.status(200).json(order);
    } catch (error: any) {
      console.error('Error fetching order:', error.message);
      res.status(500).json({ error: 'Failed to fetch order', message: error.message });
    }
  }

  /**
   * POST /orders/:id/stops
   * Replace stops for an order
   */
  async updateStops(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { stops } = req.body;

      // Validate stop sequences are unique
      const sequences = stops.map((s: any) => s.sequence).sort((a: number, b: number) => a - b);
      const uniqueSequences = new Set(sequences);
      if (uniqueSequences.size !== sequences.length) {
        res.status(400).json({ error: 'Stop sequences must be unique' });
        return;
      }

      await orderService.updateStops(id, { stops });
      res.status(200).json({ message: 'Stops updated successfully' });
    } catch (error: any) {
      if (error.message === 'Order not found') {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      console.error('Error updating stops:', error.message);
      res.status(500).json({ error: 'Failed to update stops', message: error.message });
    }
  }
}

export const orderController = new OrderController();

