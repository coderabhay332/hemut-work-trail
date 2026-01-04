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

router.post('/', validate(createOrderSchema), orderController.createOrder.bind(orderController));
router.get('/', validate(listOrdersQuerySchema), orderController.listOrders.bind(orderController));
router.get('/counts', orderController.getOrderCounts.bind(orderController));
router.get('/:id', validate(orderParamsSchema), orderController.getOrderById.bind(orderController));
router.patch('/:id/rate', validate(updateRateWithParamsSchema), orderController.updateOrderRate.bind(orderController));
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

