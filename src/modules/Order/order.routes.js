import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { auth } from '../../middlewares/auth.middleware.js'
import { validation } from '../../middlewares/validation.middleware.js'
import { systemRoles } from '../../utils/system-roles.js'
import * as orderController from './order.controller.js'
import {endpointsRoles} from './order.endpoints.js'
const router = Router()

router.post('/',
//   validation(),
  auth(endpointsRoles.PLACE_ORDER),
  expressAsyncHandler(orderController.cartToOrder)
)
router.post('/:product',
//   validation(),
  auth(endpointsRoles.PLACE_ORDER),
  expressAsyncHandler(orderController.createOrder)
)
router.get('/ship/:orderId',
//   validation(),
auth(endpointsRoles.DELIVER_ORDER),
  expressAsyncHandler(orderController.markOrderAsShipped)
)
router.get('/deliver/:orderId',
//   validation(),
  auth(endpointsRoles.DELIVER_ORDER),
  expressAsyncHandler(orderController.markOrderAsDelivered)
)
router.get('/cancel/:orderId',
//   validation(),
  auth(endpointsRoles.CANCEL_ORDER),
  expressAsyncHandler(orderController.cancelOrder)
)

export default router


/**
 * @todo Add validation middleware - payments and refunds
 */