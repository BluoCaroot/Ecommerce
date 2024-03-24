import slugify from "slugify"

import Brand from "../../../DB/Models/brand.model.js"
import Product from "../../../DB/Models/product.model.js"
import { systemRoles } from "../../utils/system-roles.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import generateUniqueString from "../../utils/generate-Unique-String.js"
import { paginationFunction } from "../../utils/pagination.js"
import * as deletion from "../../utils/deletion.js"
import { APIFeatures } from "../../utils/api-features.js"


export const addProduct = async (req, res, next) =>
{

    const { title, desc, basePrice, discount, stock, specs } = req.body
    const { categoryId, subCategoryId, brandId } = req.query
    const addedBy = req.authUser._id

    const brand = await Brand.findById(brandId)
    if (!brand) return next({ cause: 404, message: 'Brand not found' })

    if (brand.categoryId.toString() !== categoryId) return next({ cause: 400, message: 'Brand not found in this category' })
    if (brand.subCategoryId.toString() !== subCategoryId) return next({ cause: 400, message: 'Brand not found in this sub-category' })

    if (
        req.authUser.role !== systemRoles.SUPER_ADMIN &&
        brand.addedBy.toString() !== addedBy.toString()
    ) return next({ cause: 403, message: 'You are not authorized to add a product to this brand' })

    const slug = slugify(title, { lower: true, replacement: '-' }) 

    const appliedPrice = basePrice - (basePrice * (discount ? discount : 0) / 100)


    if (!req.files?.length) return next({ cause: 400, message: 'Images are required' })
    const Images = []
    const folderId = generateUniqueString(4)
    const folderPath = brand.Image.public_id.split(`${brand.folderId}/`)[0]

    for (const file of req.files)
    {
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(file.path,
        {
            folder: folderPath + `${brand.folderId}/Products/${folderId}`
        })
        Images.push({ secure_url, public_id })
    }
    req.folder = folderPath + `${brand.folderId}/Products/${folderId}`


    const product =
    {
        title, desc, slug, basePrice, discount, appliedPrice, stock, specs, categoryId, subCategoryId, brandId, addedBy, Images, folderId
    }

    const newProduct = await Product.create(product)
    req.savedDocuments.push({ model: Product, _id: newProduct._id })

    res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct })
}



export const updateProduct = async (req, res, next) =>
{
    const { title, desc, specs, stock, basePrice, discount, oldPublicId } = req.body
    const { productId } = req.params
    const addedBy = req.authUser._id


    const product = await Product.findById(productId)
    if (!product) return next({ cause: 404, message: 'Product not found' })

    if (
        req.authUser.role !== systemRoles.SUPER_ADMIN &&
        product.addedBy.toString() !== addedBy.toString()
    ) return next({ cause: 403, message: 'You are not authorized to update this product' })

    req.savedDocuments.push({ model: Product, _id: product._id, method: "edit", old: product.toObject()})

    product.title = title ? title : product.title
    product.slug = title ? slugify(title, { lower: true, replacement: '-' }) : product.slug
    product.desc = desc ? desc : product.desc
    product.specs = specs ? specs : product.specs
    product.stock = stock ? stock : product.stock

    const appliedPrice = (basePrice || product.basePrice) * (1 - ((discount || product.discount) / 100))
    product.appliedPrice = appliedPrice

    product.basePrice = basePrice ? basePrice : product.basePrice
    product.discount = discount ? discount : product.discount


    if (oldPublicId)
    {

        if (!req.file) return next({ cause: 400, message: 'Please select new image' })

        const folderPath = product.Images[0].public_id.split(`${product.folderId}/`)[0]
        const newPublicId = oldPublicId.split(`${product.folderId}/`)[1]


        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path,
        {
            folder: folderPath + `${product.folderId}`,
            public_id: newPublicId
        })
        product.Images.map((img) =>
        {
            if (img.public_id === oldPublicId)
            {
                img.secure_url = secure_url
            }
        })
        req.folder = folderPath + `${product.folderId}`
    }

    await product.save()

    res.status(200).json({ success: true, message: 'Product updated successfully', data: product })
}

export const deleteProduct = async (req, res, next) =>
{
    const { productId } = req.params

    const addedBy = req.authUser._id


    const product = await Product.findById(productId)
    if (!product) return next({ cause: 404, message: 'Product not found' })

    if (
        req.authUser.role !== systemRoles.SUPER_ADMIN &&
        product.addedBy.toString() !== addedBy.toString()
    ) return next({ cause: 403, message: 'You are not authorized to delete this product' })

    const productDeleted = await deletion.deleteProduct({productId, req, addedBy})
    if (!productDeleted) return next({ cause: 500, message: 'Failed to delete product' })
    res.status(200).json({ success: true, message: 'Product deleted successfully' })

}

export const getProduct = async (req, res, next) =>
{
    const { productId } = req.params

    const product = await Product.findById(productId)
                    .populate([{ path: 'reviews' }])

    if (!product) return next({ cause: 404, message: 'Product not found' })
    
    res.status(200).json({ success: true, data: product })
}

export const getAllProducts = async (req, res, next) =>
{
    const { sortBy, size, page, filter, populate, populateTo } = req.query



    const features = new APIFeatures(Product.find())
        .sort(sortBy)
        .pagination({size, page})
        .filters(filter)
    
    if (populate) 
        features = features.mongooseQuery.populate('Product', populateTo)

    const products = await features.mongooseQuery

    if (!products || !products.length)
        return next({ cause: 404, message: 'No product found' })
        
    res.status(200).json({ success: true, data: products })

}


