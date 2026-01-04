import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { customerSearchQuerySchema } from '../schemas/order.schema';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

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
router.get(
  '/',
  validate(customerSearchQuerySchema),
  customerController.searchCustomers.bind(customerController)
);

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
router.get(
  '/:id',
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid('Invalid customer ID format'),
      }),
    })
  ),
  customerController.getCustomerById.bind(customerController)
);

export default router;

