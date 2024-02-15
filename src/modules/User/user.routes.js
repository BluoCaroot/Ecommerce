import expressAsyncHandler from "express-async-handler";
import { Router } from "express";

import * as userRouter from './user.controller.js'
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./user.endpoints.js";
const router = Router();

router.put('/update', auth(endPointsRoles.USER_PERMS), 
expressAsyncHandler(userRouter.updateUser))

router.patch('/email', auth(endPointsRoles.USER_PERMS), 
expressAsyncHandler(userRouter.changeEmail))
router.patch('/password', auth(endPointsRoles.USER_PERMS), 
expressAsyncHandler(userRouter.changePassword))
router.delete('/delete', auth(endPointsRoles.USER_PERMS), 
expressAsyncHandler(userRouter.deleteUser))
router.get('/:id', auth(endPointsRoles.USER_PERMS, false), 
expressAsyncHandler(userRouter.getUserProfile))







export default router;