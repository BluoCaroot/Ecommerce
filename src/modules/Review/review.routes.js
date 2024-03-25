import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { auth } from '../../middlewares/auth.middleware.js'
import * as reviewController from './review.controller.js'
import * as reviewValidationSchema from './review.validationSchemas.js'
import { validation } from '../../middlewares/validation.middleware.js'
import { systemRoles } from '../../utils/system-roles.js'
const router = Router()

router.post('/:productId',
    validation(reviewValidationSchema.createReviewSchema),
    auth([systemRoles.USER]),
    expressAsyncHandler(reviewController.createReview))

router.put('/:productId',
    validation(reviewValidationSchema.editReviewSchema),
    auth([systemRoles.USER]),
    expressAsyncHandler(reviewController.updateReview))

router.delete('/:productId',
    validation(reviewValidationSchema.deleteReviewSchema),
    auth([systemRoles.USER]),
    expressAsyncHandler(reviewController.deleteReview))
    
router.get('/:productId',
    validation(reviewValidationSchema.getReviewSchema),
    expressAsyncHandler(reviewController.getReviews))



export default router
