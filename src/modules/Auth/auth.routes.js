import { Router } from "express";

import * as authController from './auth.controller.js';
import expressAsyncHandler from "express-async-handler";
import { validation } from "../../middlewares/validation.middleware.js";
import * as authValidationSchema from './auth.validationSchemas.js'

const router = Router();

router.post('/',
    validation(authValidationSchema.signUpSchema),
    expressAsyncHandler(authController.signUp))

router.get('/verify-email',
    validation(authValidationSchema.verifyEmailSchema),
    expressAsyncHandler(authController.verifyEmail))

router.post('/resend',
    validation(authValidationSchema.resendEmailSchema),
    expressAsyncHandler(authController.resendEmail))

router.post('/login',
    validation(authValidationSchema.logInSchema),
    expressAsyncHandler(authController.signIn))



export default router;