import Review from '../../../DB/Models/review.model.js'
import Order from '../../../DB/Models/order.model.js'
import Product from '../../../DB/Models/product.model.js'


export const createReview = async (req, res, next) =>
{
    const { productId } = req.params
    const { rating, review } = req.body
    const { _id: userId } = req.authUser

    const userPurchasedProduct = await Order.findOne({user: userId, /*orderItems: { $elemMatch: { _id: productId } }, */orderStatus: "Delivered"})
    if (!userPurchasedProduct)
        return next({cause: 400, message: "You can only review products you have purchased"})

    const reviewExists = await Review.findOne({userId, productId})
    if (reviewExists)
        return next({cause: 400, message: "You have already reviewed this product"})
    
    const reviewObject =
    {
        userId,
        productId,
        rating,
        review
    }
    const newReview = await Review.create(reviewObject)
    if (!newReview)
        return next({cause: 500, message: "Failed to create review"})
    req.savedDocuments.push({model: Review, _id: newReview._id, method: "add"})
    const product = await Product.findById(productId)
    if (!product)
        return next({cause: 404, message: "Failed to create review"})
    let {rate, reviewsCount} = product
    rate *= reviewsCount
    reviewsCount++
    rate += rating
    rate /= reviewsCount
    req.savedDocuments.push({model: Product, _id: productId, method: "edit", old: product.toObject()})

    product.rate = rate.toFixed(2)
    product.reviewsCount++
    const updatedProduct = await product.save()
    if (!updatedProduct)
        return next({cause: 500, message: "Failed to create review"})
    
    res.status(201).json({success: true, message: "Review created successfully", data: newReview})
}

export const updateReview = async (req, res, next) =>
{
    const { productId } = req.params
    const { rating, review } = req.body
    const { _id: userId } = req.authUser

    const reviewExists = await Review.findOne({userId, productId})

    if (!reviewExists)
        return next({cause: 404, message: "Review not found"})
    
    req.savedDocuments.push({model: Review, _id: reviewExists._id, method: "edit", old: reviewExists.toObject()})
    reviewExists.rating = rating ? rating : reviewExists.rating
    reviewExists.review = review ? review : reviewExists.review
    const updatedReview = await reviewExists.save()
    if (!updatedReview)
        return next({cause: 500, message: "Failed to update review"})
    
    const product = await Product.findById(productId)
    if (!product)
        return next({cause: 404, message: "Failed to update review"})
    
    let {rate, reviewsCount} = product
    rate *= reviewsCount
    rate -= req.savedDocuments[0].old.rating
    rate += rating
    rate /= reviewsCount
    req.savedDocuments.push({model: Product, _id: productId, method: "edit", old: product.toObject()})
    product.rate = Number(rate).toFixed(2)
    const updatedProduct = await product.save()
    if (!updatedProduct)
        return next({cause: 500, message: "Failed to update review"})
    
    res.status(200).json({success: true, message: "Review updated successfully", data: updatedReview})
}

export const deleteReview = async (req, res, next) =>
{
    const { productId } = req.params
    const { _id: userId } = req.authUser

    const reviewExists = await Review.findOne({userId, productId})
    if (!reviewExists)
        return next({cause: 404, message: "Review not found"})
    
    req.savedDocuments.push({model: Review, _id: reviewExists._id, method: "delete"})
    reviewExists.isDeleted = true
    const deletedReview = await reviewExists.save()

    if (!deletedReview)
        return next({cause: 500, message: "Failed to delete review"})
    
    const product = await Product.findById(productId)
    if (!product)
        return next({cause: 404, message: "Failed to update review"})
    
    let {rate, reviewsCount} = product
    rate *= reviewsCount
    rate -= reviewExists.rating
    reviewsCount--
    if (reviewsCount)
        rate /= reviewsCount
    req.savedDocuments.push({model: Product, _id: productId, method: "edit", old: product.toObject()})
    product.rate = Number(rate).toFixed(2)
    product.reviewsCount = reviewsCount
    const updatedProduct = await product.save()
    if (!updatedProduct)
        return next({cause: 500, message: "Failed to update review"})

    res.status(200).json({success: true, message: "Review deleted successfully"})
}

export const getReviews = async (req, res, next) =>
{
    const { productId } = req.params
    const reviews = await Review.find({productId, isDeleted: false})
    if (!reviews)
        return next({cause: 404, message: "No reviews found"})
    res.status(200).json({success: true, message: "Reviews retrieved successfully", data: reviews})
}