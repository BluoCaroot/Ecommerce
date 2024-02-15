const reqKeys = ["body", "query", "params", "headers"]

export const validation = (schema) =>
{
    return ((req, res, next) =>
    {
        let err = []

        for (const key of reqKeys)
        {
            const validate = schema[key]?.validate(req[key], {abortEarly: false})
            if (validate?.error)
            {
                err.push(...validate.error.details)
            }
        }
        if (err.length)
        {
            return res.status(400).json(
            {
                message: "validation error",
                errors: err.map(ele => ele.message)
            })
        }
        next()
    })
}