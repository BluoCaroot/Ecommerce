import expressAsyncHandler from "express-async-handler"
import { Router } from "express"

import * as  couponController from "./coupon.controller.js"
import * as couponValidationSchemas from  './coupon.validationSchemas.js'
import { validation } from "../../middlewares/validation.middleware.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { endpointsRoles } from "./coupon.endpoints.js"

const router = Router();

router.post('/' , 
    validation(couponValidationSchemas.addCouponSchema),
    auth(endpointsRoles.ADD_COUPOUN) ,
    expressAsyncHandler(couponController.addCoupon))

router.put('/:couponId' ,
    validation(couponValidationSchemas.updateCouponSchema),
    auth(endpointsRoles.ADD_COUPOUN),
    expressAsyncHandler(couponController.updateCoupon))

router.get('/' ,
    validation(couponValidationSchemas.getCouponsSchema),
    auth(endpointsRoles.ADD_COUPOUN),
    expressAsyncHandler(couponController.getCoupons))

router.put('/toggle/:couponId' ,
    validation(couponValidationSchemas.toggleCouponSchema),
    auth(endpointsRoles.ADD_COUPOUN),
    expressAsyncHandler(couponController.toggleCoupon))


export default router;