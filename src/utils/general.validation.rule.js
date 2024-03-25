import Joi from "joi";
import { Types } from "mongoose";



const objectIdValidation = (value, helper) => {
    const isValid = Types.ObjectId.isValid(value);
    return (isValid ? value : helper.message('Invalid ObjectId'))
}



export const generalValidationRule = {
    headersRule: Joi.object({
        accesstoken: Joi.string().required(),
        'user-agent': Joi.string().required(),
        'postman-token': Joi.string(),
        'content-type': Joi.string(),
        'accept-encoding': Joi.string(),
        'cache-control': Joi.string(),
        'accept': Joi.string(),
        'host': Joi.string(),
        'accept-language': Joi.string(),
        'cookie': Joi.string(),
        'connection': Joi.string(),
        'content-length': Joi.string()
    }),
    headersRuleOptional: Joi.object({
        accesstoken: Joi.string(),
        'user-agent': Joi.string().required(),
        'postman-token': Joi.string(),
        'content-type': Joi.string(),
        'accept-encoding': Joi.string(),
        'cache-control': Joi.string(),
        'accept': Joi.string(),
        'host': Joi.string(),
        'accept-language': Joi.string(),
        'cookie': Joi.string(),
        'connection': Joi.string(),
        'content-length': Joi.string()
    }),
    dbId: Joi.string().custom(objectIdValidation),

    apiFeatures: Joi.object(
    {
        size: Joi.number().required(),
        page: Joi.number().required(),
        sortBy: Joi.string().pattern(/^[a-zA-Z_]+\s+(asc|dsc)$/),
        filter: Joi.object().pattern(
            Joi.alternatives().try(
                Joi.string().pattern(/^[a-zA-Z_]+\[(gt|gte|lt|lte|in|nin|eq|ne|regex)\]$/),
                Joi.string()),
            Joi.alternatives().try(
                Joi.string(),
                Joi.number(),
                Joi.string().custom(objectIdValidation),
                Joi.array().items(Joi.string().custom(objectIdValidation)))
        ),
        populate: Joi.boolean(),
        populateTo: Joi.string().valid('SubCategory', 'Brand', 'Product', 'Reviews')
    }).with('populate', 'populateTo')

}