/**
 * Swagger/OpenAPI path definitions
 * All API endpoint documentation is centralized here
 */

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
 *
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
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, shortest, longest]
 *           default: newest
 *         description: Sort option
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
 *
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

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Search customers by name or email
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (case-insensitive partial match)
 *     responses:
 *       200:
 *         description: List of matching customers (max 10)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Validation error (query parameter required)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer details with contact info and metrics
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Customer UUID
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 primaryContact:
 *                   type: object
 *                 billingInfo:
 *                   type: object
 *                 metrics:
 *                   type: object
 *       404:
 *         description: Customer not found
 *       400:
 *         description: Invalid customer ID format
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

