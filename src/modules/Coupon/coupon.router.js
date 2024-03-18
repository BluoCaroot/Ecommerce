import expressAsyncHandler from "express-async-handler"
import { Router } from "express"

import * as  couponController from "./coupon.controller.js"
import * as couponValidationSchemas from  './coupon.validationSchemas.js'
import { validation } from "../../middlewares/validation.middleware.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { endpointsRoles } from "./coupon.endpoints.js"

const router = Router();

router.post('/' , 
    auth(endpointsRoles.ADD_COUPOUN) ,
    validation(couponValidationSchemas.addCouponSchema),
    expressAsyncHandler(couponController.addCoupon))

router.put('/:couponId' ,
    auth(endpointsRoles.ADD_COUPOUN),
    validation(couponValidationSchemas.updateCouponSchema),
    expressAsyncHandler(couponController.updateCoupon))

router.get('/' ,
    auth(endpointsRoles.ADD_COUPOUN),
    validation(couponValidationSchemas.getCouponsSchema),
    expressAsyncHandler(couponController.getCoupons))


export default router;