import Joi from "joi";

import {generalValidationRule} from '../../utils/general.validation.rule.js'

export const addCartSchema = 
{
    body: Joi.object(
    {
        productId: generalValidationRule.dbId.required(),
        quantity: Joi.number().required()
    }),
    headers: generalValidationRule.headersRule
}

export const removeCartSchema = 
{
    params: Joi.object(
    {
        productId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}