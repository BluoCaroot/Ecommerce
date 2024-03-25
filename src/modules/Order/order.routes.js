import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { auth } from '../../middlewares/auth.middleware.js'
import { validation } from '../../middlewares/validation.middleware.js'
import * as orderValidationSchema from './order.validationSchemas.js'
import * as orderController from './order.controller.js'
import {endpointsRoles} from './order.endpoints.js'
const router = Router()

router.post('/',
    validation(orderValidationSchema.checkOutValidation),
    auth(endpointsRoles.PLACE_ORDER),
    expressAsyncHandler(orderController.cartToOrder))

router.post('/webhook',
    expressAsyncHandler(orderController.stripeWebhook))

router.post('/:product',
    validation(orderValidationSchema.placeOrderValidation),
    auth(endpointsRoles.PLACE_ORDER),
    expressAsyncHandler(orderController.createOrder))

router.put('/ship/:orderId',
    validation(orderValidationSchema.markOrderAsShippedValidation),
    auth(endpointsRoles.DELIVER_ORDER),
    expressAsyncHandler(orderController.markOrderAsShipped))

router.put('/deliver/:orderId',
    validation(orderValidationSchema.markOrderAsDeliveredValidation),
    auth(endpointsRoles.DELIVER_ORDER),
    expressAsyncHandler(orderController.markOrderAsDelivered))

router.put('/cancel/:orderId',
    validation(orderValidationSchema.cancelOrderValidation),
    auth(endpointsRoles.CANCEL_ORDER),
    expressAsyncHandler(orderController.cancelOrder))

router.post('/payment/:orderId',
    validation(orderValidationSchema.payWithStripeValidation),
    auth(endpointsRoles.PLACE_ORDER),
    expressAsyncHandler(orderController.payWithStripe))

router.put('/refund/:orderId',
    validation(orderValidationSchema.refundOrderValidation),
    auth(endpointsRoles.REFUND_ORDER),
    expressAsyncHandler(orderController.refundOrder))

export default router

