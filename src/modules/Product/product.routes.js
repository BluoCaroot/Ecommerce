import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as productController from './product.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import { endPointsRoles } from './product.endpoints.js'
import { validation } from '../../middlewares/validation.middleware.js'
import * as productValidationSchema from './product.validationSchemas.js'
const router = Router()



router.post('/',
    multerMiddleHost(allowedExtensions.image ).array('image', 3),
    validation(productValidationSchema.createProductSchema),
    auth(endPointsRoles.PODUCT_RULES),
    expressAsyncHandler(productController.addProduct))

router.put('/:productId',
    multerMiddleHost(allowedExtensions.image).single('image'),
    validation(productValidationSchema.updateProductSchema),
    auth(endPointsRoles.PODUCT_RULES),
    expressAsyncHandler(productController.updateProduct))

router.delete('/:productId',
    validation(productValidationSchema.deleteProductSchema),
    auth(endPointsRoles.PODUCT_RULES),
    expressAsyncHandler(productController.deleteProduct))

router.get('/',
    validation(productValidationSchema.getAllProductsSchema),
    expressAsyncHandler(productController.getAllProducts))

router.get('/:productId',
    validation(productValidationSchema.getProductSchema),
    expressAsyncHandler(productController.getProduct))


export default router
