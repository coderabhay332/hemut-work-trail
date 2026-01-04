import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { customerSearchQuerySchema } from '../schemas/order.schema';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

router.get(
  '/',
  validate(customerSearchQuerySchema),
  customerController.searchCustomers.bind(customerController)
);

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

