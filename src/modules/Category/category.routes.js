import { Router } from "express";

import * as categoryController from './category.contoller.js'
import * as categoryValidationSchema from './category.validationSchemas.js'
import expressAsyncHandler from "express-async-handler";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "./category.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { validation } from "../../middlewares/validation.middleware.js";

const router = Router();


router.post('/',
    multerMiddleHost(allowedExtensions.image).single('image'),
    validation(categoryValidationSchema.addCategorySchema),
    auth(endPointsRoles.CATEGORY_PERMS),
    expressAsyncHandler(categoryController.addCategory))

router.put('/:categoryId',
    multerMiddleHost(allowedExtensions.image).single('image'),
    validation(categoryValidationSchema.updateCategorySchema),
    auth(endPointsRoles.CATEGORY_PERMS), 
    expressAsyncHandler(categoryController.updateCategory))

router.get('/', expressAsyncHandler(categoryController.getAllCategories))

router.delete('/:categoryId',
    validation(categoryValidationSchema.deleteCategorySchema),
    auth(endPointsRoles.CATEGORY_PERMS),
    expressAsyncHandler(categoryController.deleteCategory))

export default router;