import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as brandController from './brand.controller.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import { endPointsRoles } from './brand.endpoints.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { validation } from '../../middlewares/validation.middleware.js'
import * as brandValidationSchema from './brand.validationSchemas.js'
const router = Router()


router.post('/',
    multerMiddleHost(allowedExtensions.image).single('image'),
    validation(brandValidationSchema.addBrandSchema),
    auth(endPointsRoles.BRAND_PERM),
    expressAsyncHandler(brandController.addBrand))
    
router.put('/:brandId',
    multerMiddleHost(allowedExtensions.image).single('image'),
    validation(brandValidationSchema.updateBrandSchema),
    auth(endPointsRoles.BRAND_PERM),
    expressAsyncHandler(brandController.updateBrand))

router.delete('/:brandId',
    validation(brandValidationSchema.deleteBrandSchema),
    auth(endPointsRoles.BRAND_PERM),
    expressAsyncHandler(brandController.deleteBrand))

router.get('/',
    validation(brandValidationSchema.getBrandsSchema),
    expressAsyncHandler(brandController.getBrands))

router.get('/:brandId',
    validation(brandValidationSchema.getBrandSchema),
    expressAsyncHandler(brandController.getBrand))


export default router
