import Joi from "joi";

import { generalValidationRule } from "../../utils/general.validation.rule.js";


export const addCouponSchema =
{
    headers: generalValidationRule.headersRule,
    body:Joi.object(
    {
        couponCode: Joi.string().required().min(3).max(10).alphanum(),
        couponAmount: Joi.number().required().min(1),
        isFixed: Joi.boolean(),
        isPercentage: Joi.boolean(),
        fromDate: Joi.date().greater(Date.now()-(24*60*60*1000)).required(),
        toDate: Joi.date().greater(Joi.ref('fromDate')).required(),
        Users: Joi.array().items(Joi.object(
        {
            userId: generalValidationRule.dbId.required(),
            maxUsage: Joi.number().required().min(1)
        }))
    }).xor('isFixed', 'isPercentage')
}


export const updateCouponSchema =
{
    body:Joi.object(
    {
        couponAmount: Joi.number().required().min(1),
        isFixed: Joi.boolean(),
        isPercentage: Joi.boolean(),
        fromDate: Joi.date().greater(Date.now()-(24*60*60*1000)).required(),
        toDate: Joi.date().greater(Joi.ref('fromDate')).required(),
    }).xor('isFixed', 'isPercentage'),
    params: Joi.object(
    {
        couponId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}

export const getCouponsSchema = 
{
    headers: generalValidationRule.headersRule,
    query: Joi.object(
    {
        type: Joi.string().valid('valid', 'expired'),
        id: generalValidationRule.dbId
    }).xor('type', 'id')
}