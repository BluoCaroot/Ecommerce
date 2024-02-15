import cloudinaryConnection from "../utils/cloudinary.js"

/**
 * @description delete images from cloudinary if the request failed
 * @param {string} folderPath - the folder path of the images
 */

export const rollbackUploadedFiles = async (req, res, next) =>
{
    if (req.folder)
    {
        await cloudinaryConnection().api.delete_resources_by_prefix(req.folder)
        await cloudinaryConnection().api.delete_folder(req.folder)
    }
    next()
}