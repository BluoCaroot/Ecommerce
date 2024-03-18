
async function rollback({model, _id, method, old})
{
    switch (method)
    {
        case ("add"):
            await model.findByIdAndDelete(_id)
            break
        case ("edit"):
            await model.findByIdAndUpdate(_id, old)
            break
        case ("delete"):
            await model.create(old)
            break
    }
}


/**
 * @description delete the saved documents from the database if the request failed
 * @param {array of objects} [{model, _id}]  - the saved documents
 */

export const rollbackSavedDocuments = async (req, res, next) =>
{

    if (req.savedDocuments?.length)
    {
        for (document of req.savedDocuments)
        {
            const { model, _id , method, old} = document
            rollback({ model, _id , method, old})
        }
        
    }
}