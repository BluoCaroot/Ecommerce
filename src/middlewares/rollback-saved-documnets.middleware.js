

/**
 * @description delete the saved documents from the database if the request failed
 * @param {object} { model ,_id}  - the saved documents
 */

export const rollbackSavedDocuments = async (req, res, next) =>
{

    if (req.savedDocuments)
    {
        const { model, _id , method} = req.savedDocuments

        switch (method)
        {
            case ("add"):
                await model.findByIdAndDelete(_id)
                console.log('a')
                break
            case ("edit"):
                await model.findByIdAndUpdate(_id, req.savedDocuments.old)
                console.log(req.savedDocuments)
                break
        }
    }
}