import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as subCategoryController from './subCategory.controller.js'
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "../Category/category.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import * as subCategoryValidationSchema from './subCategory.validationSchemas.js'
import { validation } from "../../middlewares/validation.middleware.js";

const router = Router();


router.post('/:categoryId',
    multerMiddleHost(allowedExtensions.image).single('image'),
    validation(subCategoryValidationSchema.addSubCategorySchema),
    auth(endPointsRoles.CATEGORY_PERMS),
    expressAsyncHandler(subCategoryController.addSubCategory))

router.put('/:subCategoryId',
    multerMiddleHost(allowedExtensions.image).single('image'),
    validation(subCategoryValidationSchema.updateSubCategorySchema),
    auth(endPointsRoles.CATEGORY_PERMS),
    expressAsyncHandler(subCategoryController.updateSubCategory))

router.delete('/:subCategoryId',
    multerMiddleHost(allowedExtensions.image).single('image'),
    validation(subCategoryValidationSchema.deleteSubCategorySchema),
    auth(endPointsRoles.CATEGORY_PERMS),
    expressAsyncHandler(subCategoryController.deleteSubCategory))

router.get('/', 
    expressAsyncHandler(subCategoryController.getSubCategoriesWithBrands))

router.get('/:subCategoryId',
    validation(subCategoryValidationSchema.getSubCategorySchema),
    expressAsyncHandler(subCategoryController.getSubCategory))

export default router;