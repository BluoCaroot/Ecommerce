import slugify from 'slugify'

import Brand from '../../../DB/Models/brand.model.js'
import subCategory from '../../../DB/Models/sub-category.model.js'
import cloudinaryConnection from '../../utils/cloudinary.js'
import generateUniqueString from '../../utils/generate-Unique-String.js'
import * as deletion from '../../utils/deletion.js'

export const addBrand = async (req, res, next) =>
{
    const { name } = req.body
    const { categoryId, subCategoryId } = req.query
    const { _id } = req.authUser

    const subCategoryCheck = await subCategory.findById(subCategoryId).populate('categoryId', 'folderId')
    if (!subCategoryCheck) return next({ message: 'SubCategory not found', cause: 404 })

    const isBrandExists = await Brand.findOne({ name, subCategoryId })
    if (isBrandExists) return next({ message: 'Brand already exists for this subCategory', cause: 400 })

    if (categoryId != subCategoryCheck.categoryId._id) return next({ message: 'Category not found', cause: 404 })

    const slug = slugify(name, '-')

    if (!req.file) return next({ message: 'Please upload the brand logo', cause: 400 })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`,
    })
    req.folder = `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`
    const brandObject = {
        name, slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id,
        subCategoryId,
        categoryId
    }

    const newBrand = await Brand.create(brandObject)
    req.savedDocuments.push({ success: true, model: Brand, _id: newBrand._id, method: "add"})



    res.status(201).json({
        status: 'success',
        message: 'Brand added successfully',
        data: newBrand
    })

}


export const updateBrand = async (req, res, next) =>
{
    const { name, oldPublicId } = req.body
    const { brandId } = req.params
    const {_id} = req.authUser

    const brand = await Brand.findById(brandId)
    if (!brand) return next({ cause: 404, message: 'Brand not found' })

    if (brand.addedBy.toString() != _id && role != 'superAdmin')
        return next({ cause: 403, message: 'Missing permission to edit'})

    req.savedDocuments.push({ model: Brand, _id: brand._id, method: "edit", old: brand.toObject()})

    if (name) 
    {
        if (name == brand.name) 
            return next({ cause: 400, message: 'Please enter different brand name from the existing one.' })
        

        const isNameDuplicated = await Brand.findOne({ name })
        if (isNameDuplicated) 
            return next({ cause: 409, message: 'Brand name already exists' })

        brand.name = name
        brand.slug = slugify(name, '-')
    }

    if (oldPublicId)
    {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPublicId = oldPublicId.split(`${brand.folderId}/`)[1]
        const newPath = oldPublicId.split(`${newPublicId}`)[0]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: newPath,
            public_id: newPublicId
        })
        req.folder = newPath
        brand.Image.secure_url = secure_url
    }
    brand.updatedBy = _id
    await brand.save()

    res.status(200).json({ success: true, message: 'Brand updated successfully', data: brand })
}



export const deleteBrand = async (req, res, next) =>
{
    const { brandId } = req.params
    const {_id} = req.authUser

    const brand = await Brand.findById(brandId)
    if (!brand) 
        return next({ cause: 404, message: 'Brand not found' })

    if (brand.addedBy.toString() !== _id.toString() && role !== systemRoles.SUPER_ADMIN)
        return next({ cause: 403, message: 'Missing permission to delete'})

    const brandDeleted = await deletion.deleteBrand(brandId, req, _id)
    if (!brandDeleted) 
        return next({ cause: 500, message: 'Failed to delete brand' })
    res.status(200).json({ success: true, message: 'Brand deleted successfully' })
}


export const getBrands = async (req, res, next) =>
{
    const { subCategoryId , categoryId } = req.query

    let query = {}
    if (subCategoryId) query.subCategoryId = subCategoryId
    if (categoryId) query.categoryId = categoryId
    const brands = await Brand.find(query)

    res.status(200).json({success: true, message: 'List of brands', data: brands})
}