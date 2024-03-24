import slugify from 'slugify'

import Category from '../../../DB/Models/category.model.js'
import Subcategory from '../../../DB/Models/sub-category.model.js'
import cloudinaryConnection from '../../utils/cloudinary.js'
import generateUniqueString from '../../utils/generate-Unique-String.js'
import * as deletion from '../../utils/deletion.js'
import { APIFeatures } from '../../utils/api-features.js'


export const addCategory = async (req, res, next) =>
{
    const { name } = req.body
    const { _id } = req.authUser
    
    const isNameDuplicated = await Category.findOne({ name })
    if (isNameDuplicated) 
        return next({ cause: 409, message: 'Category name already exists' })

    const slug = slugify(name, '-')

    if (!req.file) return next({ cause: 400, message: 'Image is required' })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path,
    {
        folder: `${process.env.MAIN_FOLDER}/Categories/${folderId}`
    })
    req.folder = `${process.env.MAIN_FOLDER}/Categories/${folderId}`

    const category =
    {
        name,
        slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id
    }
    const categoryCreated = await Category.create(category)
    if (!categoryCreated) return next({ cause: 500, message: 'Failed to create category' })
    req.savedDocuments.push({ model: Category, _id: categoryCreated._id, method: "add"})

    res.status(201).json({ success: true, message: 'Category created successfully', data: categoryCreated })
}

export const updateCategory = async (req, res, next) =>
{
    const { name, oldPublicId } = req.body
    const { categoryId } = req.params
    const { _id } = req.authUser

    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

   

    req.savedDocuments.push({ model: Category, _id: category._id, method: "edit", old: category.toObject()})
    
    if (name) 
    {
        if (name == category.name) 
            return next({ cause: 400, message: 'Please enter different category name from the existing one.' })
        

        const isNameDuplicated = await Category.findOne({ name })
        if (isNameDuplicated) 
            return next({ cause: 409, message: 'Category name already exists' })

        category.name = name
        category.slug = slugify(name, '-')
    }

    if (oldPublicId)
    {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPulicId = oldPublicId.split(`${category.folderId}/`)[1]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`,
            public_id: newPulicId
        })
        req.folder = `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`
        category.Image.secure_url = secure_url
    }
    category.updatedBy = _id
    await category.save()

    res.status(200).json({ success: true, message: 'Category updated successfully', data: category })
}

export const deleteCategory = async (req, res, next) =>
{
    const { categoryId } = req.params
    const { _id } = req.authUser

    const category = await Category.findById(categoryId)
    if (!category) 
        return next({ cause: 404, message: 'Category not found' })

    const categoryDeleted = await deletion.deleteCategory({categoryId, req, _id})
    if (!categoryDeleted) 
        return next({ cause: 500, message: 'Failed to delete category' })
    res.status(200).json({ success: true, message: 'Category deleted successfully' })
}

export const getAllCategories = async (req, res, next) =>
{
    const { sortBy, page, size, filter, populate, populateTo } = req.query
    const features = new APIFeatures(Category.find())
        .sort(sortBy)
        .pagination({size, page})
        .filters(filter)
    
    if (populate) 
        features = features.mongooseQuery.populate('Category', populateTo)

    const categories = await features.mongooseQuery
    if (!categories || !categories.length) return next({ cause: 404, message: 'Categories not found' })
    res.status(200).json({ success: true, message: 'Categories fetched successfully', data: categories })
}

export const getCategory = async (req, res, next) =>
{
    const { categoryId } = req.params
    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })
    res.status(200).json({ success: true, message: 'Category fetched successfully', data: category })
}