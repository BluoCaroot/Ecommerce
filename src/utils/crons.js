import { scheduleJob } from "node-schedule"
import { DateTime } from "luxon"

import Order from "../../DB/Models/order.model.js"
import User from "../../DB/Models/user.model.js"
import Coupon from "../../DB/Models/coupon.model.js"
import Product from "../../DB/Models/product.model.js"
import Brand from "../../DB/Models/brand.model.js"
import SubCategory from "../../DB/Models/sub-category.model.js"
import Category from "../../DB/Models/category.model.js"
import cloudinaryConnection from "./cloudinary.js"

export function detectExpiredCoupons()
{
    scheduleJob("0 0 * * *", async () => {
        const coupons = await Coupon.find({status: "valid"})
        for (const coupon of coupons)
        {
            if (DateTime.fromISO(coupon.toDate) < DateTime.now())
            {
                coupon.status = "expired"
                coupon.disabledAt = Date.now()
                await coupon.save()
            }
        }
    })
}

export function detectUnconfirmedOrders()
{
    scheduleJob("0 0 * * *", async () => {
        const orders = await Order.find({orderStatus: "Pending"})
        for (const order of orders)
        {
            if (DateTime.fromISO(order.createdAt) < DateTime.now().minus({days: 1}))
            {
                order.orderStatus = "Cancelled"
                await order.save()
            }
        }
    })
}

export function DeleteOldImages()
{
    scheduleJob("0 0 * * *", async () =>
    {
        const products = await Product.find({isDeleted: true, imagesDeleted: false})
        for (const product of products)
        {
            if (DateTime.fromISO(product.deletedAt) > DateTime.now().minus({days: 30}))
                continue;
            const {folderId} = product
            const folderPath = product.Images[0].public_id.split(`${folderId}/`)[0] + folderId
            await cloudinaryConnection().api.delete_resources_by_prefix(folderPath)
            await cloudinaryConnection().api.delete_folder(folderPath)
            product.imagesDeleted = true
            await product.save()
        }   
        const brands = await Brand.find({isDeleted: true, imagesDeleted: false})
        for (const brand of brands)
        {
            if (DateTime.fromISO(brand.deletedAt) > DateTime.now().minus({days: 30}))
                continue;
            const {folderId} = brand
            const folderPath = brand.Image.public_id.split(`${folderId}/`)[0] + folderId
            await cloudinaryConnection().api.delete_resources_by_prefix(folderPath)
            await cloudinaryConnection().api.delete_folder(folderPath)
            brand.imagesDeleted = true
            await brand.save()
        }
        const subCategories = await SubCategory.find({isDeleted: true, imagesDeleted: false})
        for (const subCategory of subCategories)
        {
            if (DateTime.fromISO(subCategory.deletedAt) > DateTime.now().minus({days: 30}))
                continue;
            const {folderId} = subCategory
            const folderPath = subCategory.Image.public_id.split(`${folderId}/`)[0] + folderId
            await cloudinaryConnection().api.delete_resources_by_prefix(folderPath)
            await cloudinaryConnection().api.delete_folder(folderPath)
            subCategory.imagesDeleted = true
            await subCategory.save()
        }
        const categories = await Category.find({isDeleted: true, imagesDeleted: false})
        for (const category of categories)
        {
            if (DateTime.fromISO(category.deletedAt) > DateTime.now().minus({days: 30}))
                continue;
            const {folderId} = category
            const folderPath = category.Image.public_id.split(`${folderId}/`)[0] + folderId
            await cloudinaryConnection().api.delete_resources_by_prefix(folderPath)
            await cloudinaryConnection().api.delete_folder(folderPath)
            category.imagesDeleted = true
            await category.save()
        }
    })
}

export function detecteUncofirmedUsers()
{
    scheduleJob("0 0 * * *", async () => {
        const users = await User.find({isEmailVerified: false})
        for (const user of users)
        {
            if (DateTime.fromISO(user.createdAt) < DateTime.now().minus({days: 7}))
            {
                user.isEmailVerified = true
                await user.save()
            }
        }
    })
}