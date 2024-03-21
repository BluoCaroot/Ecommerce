import Joi from "joi"

import { generalValidationRule } from "../../utils/general.validation.rule.js"


export const addCategorySchema = 
{
    body: Joi.object(
    {
        name: Joi.string().required()
    }),
    headers: generalValidationRule.headersRule
}

export const getCategorySchema = 
{
    params: Joi.object(
    {
        categoryId: generalValidationRule.dbId.required()
    })
}

export const updateCategorySchema = 
{
    body: Joi.object(
    {
        oldPublicId: Joi.string(),
        name: Joi.string()
    }),
    params: Joi.object(
    {
        categoryId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}

export const getSubcategoriesSchema = 
{
    params: Joi.object(
    {
        categoryId: generalValidationRule.dbId.required()
    })
}

export const deleteCategorySchema = 
{
    params: Joi.object(
    {
        categoryId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}