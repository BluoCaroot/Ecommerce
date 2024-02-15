import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as subCategoryController from './subCategory.controller.js'
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "../Category/category.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";

const router = Router();


router.post('/:categoryId',
    auth(endPointsRoles.CATEGORY_PERMS),
    multerMiddleHost(allowedExtensions.image).single('image'),
    expressAsyncHandler(subCategoryController.addSubCategory))
router.put('/:subCategoryId',
    auth(endPointsRoles.CATEGORY_PERMS),
    multerMiddleHost(allowedExtensions.image).single('image'),
    expressAsyncHandler(subCategoryController.updateSubCategory))
router.delete('/:subCategoryId',
    auth(endPointsRoles.CATEGORY_PERMS),
    multerMiddleHost(allowedExtensions.image).single('image'),
    expressAsyncHandler(subCategoryController.deleteSubCategory))
router.get('/', 
    expressAsyncHandler(subCategoryController.getSubCategoriesWithBrands))

export default router;