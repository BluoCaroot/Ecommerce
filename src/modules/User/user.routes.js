import expressAsyncHandler from "express-async-handler";
import { Router } from "express";

import * as userRouter from './user.controller.js'
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./user.endpoints.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as uservalidationSchema from './user.validationSchemas.js'
const router = Router();

router.put('/update', 
    validation(uservalidationSchema.updateUserSchema),
    auth(endPointsRoles.USER_PERMS), 
    expressAsyncHandler(userRouter.updateUser))

router.patch('/email', 
    validation(uservalidationSchema.changeEmailSchema),
    auth(endPointsRoles.USER_PERMS), 
    expressAsyncHandler(userRouter.changeEmail))

router.patch('/password',
    validation(uservalidationSchema.changePasswordSchema),
    auth(endPointsRoles.USER_PERMS), 
    expressAsyncHandler(userRouter.changePassword))

router.delete('/delete', 
    validation(uservalidationSchema.deleteUserSchema),
    auth(endPointsRoles.USER_PERMS), 
    expressAsyncHandler(userRouter.deleteUser))

router.get('/:id',
    validation(uservalidationSchema.getUserDataSchema),
    auth(endPointsRoles.USER_PERMS, false), 
    expressAsyncHandler(userRouter.getUserProfile))


export default router;