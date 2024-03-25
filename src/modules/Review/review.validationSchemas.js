import Joi from 'joi'

import { generalValidationRule } from '../../utils/general.validation.rule.js'

export const createReviewSchema =
{
    body: Joi.object(
    {
        rating: Joi.number().valid(1, 2, 3, 4, 5).required(),
        review: Joi.string()
    }),
    params: Joi.object(
    {
        productId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}
export const editReviewSchema =
{
    body: Joi.object(
    {
        rating: Joi.number().valid(1, 2, 3, 4, 5),
        review: Joi.string()
    }),
    params: Joi.object(
    {
        productId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}
export const deleteReviewSchema =
{
    params: Joi.object(
    {
        productId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}
export const getReviewSchema =
{
    params: Joi.object(
    {
        productId: generalValidationRule.dbId.required()
    })
}