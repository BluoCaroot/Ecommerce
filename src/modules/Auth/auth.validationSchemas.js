import Joi from "joi";


export const signUpSchema =
{
    body: Joi.object(
    {
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        confirmEmail: Joi.string().valid(Joi.ref('email')),
        password: Joi.string().required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')),
        age: Joi.number(),
        phoneNumbers: Joi.array().items(Joi.string().min(8).max(16)),
        addresses: Joi.array().items(Joi.string())
    })
    .with('password', 'confirmPassword')
    .with('email', 'confirmEmail')
}

export const resendEmailSchema =
{
    body: Joi.object(
    {
        email: Joi.string().email().required()
    })
}

export const logInSchema =
{
    body: Joi.object(
    {
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })
}

export const verifyEmailSchema =
{
    query: Joi.object(
    {
        token: Joi.string().required()
    })
}

export const forgetPasswordSchema =
{
    body: Joi.object(
    {
        email: Joi.string().email().required()
    })
}

export const resetPasswordSchema =
{
    body: Joi.object(
    {
        token: Joi.string().required(),
        password: Joi.string().required(),
        confirmPassword: Joi.string().valid(Joi.ref('password'))
    })
    .with('password', 'confirmPassword')
}