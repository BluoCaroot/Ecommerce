import Joi from 'joi'

import { generalValidationRule } from '../../utils/general.validation.rule.js'

export const addSubCategorySchema = 
{
    body: Joi.object(
    {
        name: Joi.string().required()
    }),
    params: Joi.object(
    {
        CategoryId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}

export const updateSubCategorySchema = 
{
    body: Joi.object(
    {
        oldPublicId: Joi.string(),
        name: Joi.string()
    }),
    params: Joi.object(
    {
        subCategoryId: generalValidationRule.dbId.required() 
    }),
    headers: generalValidationRule.headersRule
}


export const deleteSubCategorySchema = 
{
    params: Joi.object(
    {
        subCategoryId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}