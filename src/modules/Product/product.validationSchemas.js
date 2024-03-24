import Joi from "joi"
import { generalValidationRule } from "../../utils/general.validation.rule.js"


export const createProductSchema = 
{
    body: Joi.object(
    {
        title: Joi.string().required(),
        desc: Joi.string().required(),
        basePrice: Joi.number().required(),
        discount: Joi.number(),
        stock: Joi.number().required(),
        specs: Joi.object().pattern(
            Joi.string(),
            Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number()))
        ).required()
    }),
    query: Joi.object(
    {
        brandId: generalValidationRule.dbId,
        subCategoryId: generalValidationRule.dbId,
        categoryId: generalValidationRule.dbId
    }).required(),
    headers: generalValidationRule.headersRule
}

export const updateProductSchema = 
{
    body: Joi.object(
    {
        title: Joi.string(),
        desc: Joi.string(),
        basePrice: Joi.number(),
        discount: Joi.number(),
        stock: Joi.number(),
        specs: Joi.object().pattern(
            Joi.string(),
            Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number()))),
        oldPublicId: Joi.string(),
    }),
    params: Joi.object(
    {
        productId: generalValidationRule.dbId.required(),
    }),
    headers: generalValidationRule.headersRule
}

export const deleteProductSchema =
{
    params: Joi.object(
    {
        productId: generalValidationRule.dbId.required(),
    }),
    headers: generalValidationRule.headersRule
}

export const getProductSchema =
{
    params: Joi.object(
    {
        productId: generalValidationRule.dbId.required(),
    })
}

export const getAllProductsSchema = 
{
    query: generalValidationRule.apiFeatures
}