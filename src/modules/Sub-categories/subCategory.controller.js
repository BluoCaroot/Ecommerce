import slugify from "slugify"

import SubCategory from "../../../DB/Models/sub-category.model.js"
import Category from '../../../DB/Models/category.model.js'
import generateUniqueString from "../../utils/generate-Unique-String.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import * as deletion from "../../utils/deletion.js"

export const addSubCategory = async (req, res, next) =>
{
    const { name } = req.body
    const { categoryId } = req.params
    const { _id } = req.authUser

    const isNameDuplicated = await SubCategory.findOne({ name })
    if (isNameDuplicated) 
        return next({ cause: 409, message: 'SubCategory name already exists' })

    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    const slug = slugify(name, '-')

    if (!req.file) return next({ cause: 400, message: 'Image is required' })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path,
    {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`
    })

    const subCategory =
    {
        name,
        slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id,
        categoryId
    }
    const subCategoryCreated = await SubCategory.create(subCategory)
    req.savedDocuments.push({ model: SubCategory, _id: subCategory._id, method: "add"})

    res.status(201).json({ success: true, message: 'subCategory created successfully', data: subCategoryCreated })
}


export const updateSubCategory = async (req, res, next) =>
{
    const { name, oldPublicId } = req.body
    const { subCategoryId } = req.params
    const { _id } = req.authUser

    const subCategory = await SubCategory.findById(subCategoryId)
    if (!subCategory) return next({ cause: 404, message: 'subCategory not found' })

    
    req.savedDocuments.push({ model: SubCategory, _id: subCategory._id, method: "edit", old: subCategory.toObject()})
    
    if (name) 
    {
        if (name == subCategory.name) 
            return next({ cause: 400, message: 'Please enter different subCategory name from the existing one.' })
        

        const isNameDuplicated = await SubCategory.findOne({ name })
        if (isNameDuplicated) 
            return next({ cause: 409, message: 'SubCategory name already exists' })

        subCategory.name = name
        subCategory.slug = slugify(name, '-')
    }

    if (oldPublicId)
    {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPublicId = oldPublicId.split(`${subCategory.folderId}/`)[1]
        const newPath =oldPublicId.split(`${newPublicId}`)[0]
        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${newPath}`,
            public_id: newPublicId
        })
        req.folder = newPath
        subCategory.Image.secure_url = secure_url
    }
    subCategory.updatedBy = _id
    await subCategory.save()

    res.status(200).json({ success: true, message: 'Category updated successfully', data: subCategory })
}

export const deleteSubCategory = async (req, res, next) =>
{
    const { subCategoryId } = req.params
    const {_id} = req.authUser

    const subCategory = await SubCategory.findById(subCategoryId)
    if (!subCategory) 
        return next({ cause: 404, message: 'subCategory not found' })

    const subCategoryDeleted = await deletion.deleteSubCategory({subCategoryId, req, _id})
    if (!subCategoryDeleted) 
        return next({ cause: 500, message: 'Error deleting subCategory' })
    res.status(200).json({ success: true, message: 'Category deleted successfully' })
}

export const getSubCategoriesWithBrands = async (req, res, next) =>
{
    const subCategories = await SubCategory.find().populate([{
        path: 'Brands'
    }])

    res.status(200).json({ success: true, message: 'List of subCategories with brands', data: subCategories})
}

export const getSubCategory = async (req, res, next) =>
{
    const { subCategoryId } = req.params
    const subCategory = await SubCategory.findById(subCategoryId)
    if (!subCategory) return next({ cause: 404, message: 'SubCategory not found' })
    res.status(200).json({ success: true, message: 'SubCategory fetched successfully', data: subCategory })
}