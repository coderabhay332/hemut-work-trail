import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import {
  createOrderSchema,
  listOrdersQuerySchema,
  orderParamsSchema,
  updateRateWithParamsSchema,
  updateStopsWithParamsSchema,
} from '../schemas/order.schema';
import { validate } from '../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order with stops
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
router.post('/', validate(createOrderSchema), orderController.createOrder.bind(orderController));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: List orders with pagination and search
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search by customer name or order ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderListResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.get('/', validate(listOrdersQuerySchema), orderController.listOrders.bind(orderController));

/**
 * @swagger
 * /orders/counts:
 *   get:
 *     summary: Get order counts (inbound and outbound)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inbound:
 *                   type: number
 *                   description: Total number of orders
 *                 outbound:
 *                   type: number
 *                   description: Total number of delivery stops
 *       500:
 *         description: Server error
 */
router.get('/counts', orderController.getOrderCounts.bind(orderController));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details with stops
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order UUID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       400:
 *         description: Invalid order ID format
 *       500:
 *         description: Server error
 */
router.get('/:id', validate(orderParamsSchema), orderController.getOrderById.bind(orderController));

/**
 * @swagger
 * /orders/{id}/rate:
 *   patch:
 *     summary: Update order rate
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rate
 *             properties:
 *               rate:
 *                 type: number
 *                 description: New rate value
 *     responses:
 *       200:
 *         description: Rate updated successfully
 *       400:
 *         description: Invalid rate value
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/rate', validate(updateRateWithParamsSchema), orderController.updateOrderRate.bind(orderController));

/**
 * @swagger
 * /orders/{id}/stops:
 *   post:
 *     summary: Update order stops (replace all stops)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStopsRequest'
 *     responses:
 *       200:
 *         description: Stops updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Stops updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update order stops (replace all stops)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStopsRequest'
 *     responses:
 *       200:
 *         description: Stops updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:id/stops',
  validate(updateStopsWithParamsSchema),
  orderController.updateStops.bind(orderController)
);

router.put(
  '/:id/stops',
  validate(updateStopsWithParamsSchema),
  orderController.updateStops.bind(orderController)
);

export default router;

