import Product from '../../DB/Models/product.model.js'
import Brand from '../../DB/Models/brand.model.js'
import Category from '../../DB/Models/category.model.js'
import SubCategory from '../../DB/Models/sub-category.model.js'
import User from '../../DB/Models/user.model.js'
import Review from '../../DB/Models/review.model.js'

export async function deleteReview({reviewId, req, _id})
{
    req.savedDocuments.push({ model: Review, _id: reviewId, method: "delete"})
    const review = await Review.findByIdAndUpdate(reviewId, { isDeleted: true, deletedBy: _id})
    return review ? true : false
}

export async function deleteProduct({productId, req, _id})
{
    let ret = true
    req.savedDocuments.push({ model: Product, _id: productId, method: "delete"})
    const product = await Product.findByIdAndUpdate(productId, { isDeleted: true, deletedBy: _id })
    if (!product) 
        return false
    const reviews = await Review.find({ productId })
    for (const review of reviews)
        ret &&= await deleteReview({reviewId: review._id, req, _id})
    return ret
}

export async function deleteBrand({brandId, req, _id})
{
    let ret = true
    req.savedDocuments.push({ model: Brand, _id: brandId, method: "delete"})
    const brand = await Brand.findByIdAndUpdate(brandId, { isDeleted: true, deletedBy: _id})
    if (!brand) 
        return false
    const products = await Product.find({ brandId})
    for (const product of products)
        ret &&= await deleteProduct({productId:product._id, req, _id})
    return ret
}

export async function deleteSubCategory({subCategoryId, req, _id})
{
    let ret = true
    req.savedDocuments.push({ model: SubCategory, _id: subCategoryId, method: "delete"})
    const subCategory = await SubCategory.findByIdAndUpdate(subCategoryId, { isDeleted: true, deletedBy: _id})
    if (!subCategory) 
        return false
    const brands = await Brand.find({ subCategoryId})
    for (const brand of brands)
        ret &&= await deleteBrand({brandId:brand._id, req, _id})
    return ret
}

export async function deleteCategory({categoryId, req, _id})
{
    let ret = true
    req.savedDocuments.push({ model: Category, _id: categoryId, method: "delete"})
    const category = await Category.findByIdAndUpdate(categoryId, { isDeleted: true, deletedBy: _id})
    if (!category) 
        return false
    const subCategories = await SubCategory.find({ categoryId})
    for (const subCategory of subCategories)
        ret &&= await deleteSubCategory({subCategoryId: subCategory._id, req, _id})
    return ret
}


export async function deleteUser({userId, req})
{
    req.savedDocuments.push({ model: User, _id: userId, method: "delete"})
    const user = await User.findByIdAndUpdate(userId, { isDeleted: true })
    return user ? true : false
}