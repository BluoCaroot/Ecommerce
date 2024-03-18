

export const init = async(req, res, next) =>
{
    req.savedDocuments = []
    next()
}