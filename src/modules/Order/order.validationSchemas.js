import Joi from "joi";

import { generalValidationRule } from "../../utils/general.validation.rule.js";


export const placeOrderValidation = 
{
    body: Joi.object(
    {
        quantity: Joi.number().required(),

        couponCode: Joi.string().min(3).max(10).alphanum(),
        paymentMethod: Joi.string().required().valid('Cash', 'Stripe', 'Paymob'),
        phoneNumber: Joi.string().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        postalCode: Joi.string().required(),
        country: Joi.string().required()
    }),
    headers: generalValidationRule.headersRule,
    params: Joi.object(
    {
        product: generalValidationRule.dbId
    }).required()

}

export const checkOutValidation =
{
    body: Joi.object(
    {        
        couponCode: Joi.string().min(3).max(10).alphanum(),
        paymentMethod: Joi.string().required().valid('Cash', 'Stripe', 'Paymob'),
        phoneNumber: Joi.string().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        postalCode: Joi.string().required(),
        country: Joi.string().required()
    }),
    headers: generalValidationRule.headersRule

}

export const markOrderAsShippedValidation =
{
    params: Joi.object(
    {
        orderId: generalValidationRule.dbId
    }).required(),
    headers: generalValidationRule.headersRule
}

export const markOrderAsDeliveredValidation =
{
    params: Joi.object(
    {
        orderId: generalValidationRule.dbId
    }).required(),
    headers: generalValidationRule.headersRule
}

export const cancelOrderValidation =
{
    params: Joi.object(
    {
        orderId: generalValidationRule.dbId
    }).required(),
    headers: generalValidationRule.headersRule
}