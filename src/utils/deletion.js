import Product from '../../DB/Models/product.model.js'
import Brand from '../../DB/Models/brand.model.js'
import Category from '../../DB/Models/category.model.js'
import SubCategory from '../../DB/Models/sub-category.model.js'
import User from '../../DB/Models/user.model.js'

export async function delteProduct({productId, req, _id})
{
    req.savedDocuments.push({ model: Product, _id: product._id, method: "delete"})
    const product = await Product.findByIdAndUpdate(productId, { isDeleted: true, deletedBy: _id })
    return product ? true : false
}

export async function deleteBrand({brandId, req, _id})
{
    let ret = true
    req.savedDocuments.push({ model: Brand, _id: brand._id, method: "delete"})
    const brand = await Brand.findByIdAndUpdate(brandId, { isDeleted: true})
    if (!brand) 
        return false
    const products = await Product.find({ brandId})
    for (const product of products)
        ret &&= await delteProduct({productId:product._id, req, _id})
    return ret
}

export async function deleteSubCategory({subCategoryId, req, _id})
{
    let ret = true
    req.savedDocuments.push({ model: SubCategory, _id: subCategory._id, method: "delete"})
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
    req.savedDocuments.push({ model: Category, _id: category._id, method: "delete"})
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
    req.savedDocuments.push({ model: User, _id: user._id, method: "delete"})
    const user = await User.findByIdAndUpdate(userId, { isDeleted: true })
    return user ? true : false
}