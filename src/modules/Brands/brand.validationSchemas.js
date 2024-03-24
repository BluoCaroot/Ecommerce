import Joi from "joi";

import {generalValidationRule} from '../../utils/general.validation.rule.js'



export const addBrandSchema =
{
    body: Joi.object(
    {
        name: Joi.string().required(),
    }),
    query: Joi.object(
    {
        categoryId: generalValidationRule.dbId.required(),
        subCategoryId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}


export const updateBrandSchema =
{
    body: Joi.object(
    {
        name: Joi.string(),
        oldPublicId: Joi.string()

    }),
    params: Joi.object(
    {
        brandId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}


export const deleteBrandSchema =
{
    params: Joi.object(
    {
        brandId: generalValidationRule.dbId.required()
    }),
    headers: generalValidationRule.headersRule
}

export const getBrandsSchema =
{
    query: generalValidationRule.apiFeatures
}