import { Router } from "express";
import * as  cartController from "./cart.controller.js";
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as cartValidationSchema from './cart.validationSchemas.js'
const router = Router();




router.post('/', 
    validation(cartValidationSchema.addCartSchema),
    auth([systemRoles.USER]),
    expressAsyncHandler(cartController.addProductToCart))

router.put('/:productId', 
    validation(cartValidationSchema.removeCartSchema),
    auth([systemRoles.USER]),
    expressAsyncHandler(cartController.removeProductFromCart))

export default router