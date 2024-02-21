
import Joi from "joi"
import { generalValidationRule } from "../../utils/general.validation.rule.js"

export const updateUserSchema =
{
    body: Joi.object(
    {
        username: Joi.string(),
        password: Joi.string(),
        age: Joi.number(),
        phoneNumbers: Joi.array().items(Joi.string().min(8).max(16)),
        addresses: Joi.array().items(Joi.string())
    }),
    headers: generalValidationRule.headersRule
}
export const changeEmailSchema = 
{
    body: Joi.object(
    {
        email: Joi.string().email(),
        password: Joi.string(),
    }).required(),
    headers: generalValidationRule.headersRule

}
export const changePasswordSchema = 
{
    body: Joi.object(
    {
        password: Joi.string(),
        oldPassword: Joi.string(),
    }).required(),
    headers: generalValidationRule.headersRule
}
export const deleteUserSchema =
{
    body: Joi.object(
    { 
        password: Joi.string(),
    }).required(),
    headers: generalValidationRule.headersRule
}

export const getUserDataSchema =
{
    params: Joi.object(
    {
        id: generalValidationRule.dbId
    }).required(),
    headers: generalValidationRule.headersRuleOptional
}
