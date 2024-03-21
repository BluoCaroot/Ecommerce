import Order from '../../../DB/Models/order.model.js'
import Product from '../../../DB/Models/product.model.js'
import CouponUsers from '../../../DB/Models/coupon-users.model.js'
import { applyCoupon, couponValidation } from '../../utils/coupon.js'
import Cart from '../../../DB/Models/cart.model.js'

export const createOrder = async (req, res, next) =>
{
    const 
    {
        quantity,
        couponCode,
        paymentMethod,
        phoneNumber,
        address,
        city,
        postalCode,
        country
    } = req.body
    const {_id} = req.authUser
    const {product} = req.params
    let coupon;
    if (couponCode)
    {
        const couponValid = await couponValidation(couponCode, _id)
        if (couponValid.error)
            return next({ message: couponValid.message, cause: couponValid.status })
        console.log(couponValid)
        coupon = couponValid
    }

    const productExists = await Product.findById(product)
    if (!productExists || productExists.countInStock < quantity)
        return next({ message: 'Product is not available', cause: 404 })
    
    let orderItems =
    [{
        title: productExists.title,
        quantity,
        price: productExists.appliedPrice,
        product
    }]
    const shippingPrice = productExists.appliedPrice * quantity

    const totalPrice = applyCoupon(coupon, shippingPrice)
    if (totalPrice == null)
        return next({ message: 'Coupon can not be used with this order', cause: 400 })

    const orderStatus = (paymentMethod === 'Cash' ? 'Placed' : 'Pending')
    const order =
    {
        user: _id,
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        phoneNumber,
        shippingPrice,
        coupon: coupon?._id,
        totalPrice,
        paymentMethod,
        orderStatus
    }

    const newOrder = await Order.create(order)
    if (!newOrder)
        return next({ message: 'Order could not be placed', cause: 500 })
    req.savedDocuments.push({ model: Order, _id: newOrder._id, method: 'add' })
    
    req.savedDocuments.push({ model: Product, _id: product, method: 'edit', old: productExists.toObject() })
    productExists.stock -= quantity
    let productUpdated
    if (!productExists.stock)
    {
        productUpdated = await Product.findByIdAndDelete(product)
        req.savedDocuments[req.savedDocuments.length - 1].method = 'delete'
    }
    else
        productUpdated = await productExists.save()

    if (!productUpdated)
        return next({ message: 'Order could not be placed', cause: 500 })
    if (couponCode)
    {
        const userCoupon = await CouponUsers.findOne({ couponId: coupon._id, userId: _id })
        req.savedDocuments.push({ model: CouponUsers,
        _id: userCoupon._id, method: 'edit',
        old: userCoupon.toObject() })

        userCoupon.usageCount += 1
        const couponUpdated = await userCoupon.save()
        if (!couponUpdated)
            return next({success: true, message: 'Order could not be placed', cause: 500 })
    }
    
    res.status(201).json({message: "Order placed successfully", data: newOrder})
}

export const cartToOrder = async (req, res, next) =>
{
    const 
    {
        couponCode,
        paymentMethod,
        phoneNumber,
        address,
        city,
        postalCode,
        country
    } = req.body
    const {_id} = req.authUser
    const userCart = await Cart.findOne({ userId: _id })
    if (!userCart)
        return next({ message: 'Cart is empty', cause: 400 })

    let coupon;
    if (couponCode)
    {
        const couponValid = await couponValidation(couponCode, _id)
        if (couponValid.message)
            return next({ message: couponValid.message, cause: couponValid.status })
        coupon = couponValid
    }

    let orderItems = userCart.products.map(product => {
        return {
            title: product.title,
            quantity: product.quantity,
            price: product.finalPrice,
            product: product.productId
        }
    })
    const shippingPrice = userCart.subTotal

    const totalPrice = applyCoupon(coupon, shippingPrice)
    if (totalPrice == null)
        return next({ message: 'Coupon can not be used with this order', cause: 400 })

    const orderStatus = (paymentMethod === 'Cash' ? 'Placed' : 'Pending')
    const order =
    {
        user: _id,
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        phoneNumber,
        shippingPrice,
        coupon: coupon?._id,
        totalPrice,
        paymentMethod,
        orderStatus
    }
    const newOrder = await Order.create(order)
    if (!newOrder)
        return next({ message: 'Order could not be placed', cause: 500 })
    req.savedDocuments.push({ model: Order, _id: newOrder._id, method: 'add' })
    if (coupon)
    {
        const userCoupon = await CouponUsers.findOne({ couponId: coupon._id, userId: _id })
        req.savedDocuments.push({ model: CouponUsers,
        _id: userCoupon._id, method: 'edit',
        old: userCoupon.toObject() })

        userCoupon.usageCount += 1
        const couponUpdated = await userCoupon.save()
        if (!couponUpdated)
            return next({ message: 'Order could not be placed', cause: 500 })
    }

    for (const item of userCart.products)
    {
        const product = await Product.findById(item.productId)
        req.savedDocuments.push({ model: Product, _id: product._id, method: 'edit', old: product.toObject() })
        product.stock -= item.quantity
        let productUpdated
        if (!product.stock)
        {
            productUpdated = await Product.findByIdAndDelete(product._id)
            req.savedDocuments[req.savedDocuments.length - 1].method = 'delete'
        }
        else
            productUpdated = await product.save()
        if (!productUpdated)
            return next({ message: 'Order could not be placed', cause: 500 })
    }

    req.savedDocuments.push({ model: Cart, _id: userCart._id, method: 'delete', old: userCart.toObject()})
    const cartRemoved = await Cart.findOneAndDelete({ userId: _id })

    if (!cartRemoved)
        return next({ message: 'Order could not be placed', cause: 500 })

    res.status(201).json({success: true, message: "Order placed successfully", data: newOrder})
}

export const markOrderAsShipped = async (req, res, next) =>
{
    const { orderId } = req.params
    
    req.savedDocuments.push({model: Order, _id: orderId, method: 'edit'});

    const updateOrder = await Order.findOneAndUpdate({
        _id: orderId,
        orderStatus: {$in: ['Paid','Placed']}
    },{
        orderStatus: 'Shipped',
    },
    {
        new: true
    })
    if(!updateOrder) return next({message: 'Order not found or cannot be delivered', cause: 404});

    res.status(200).json({success: true, message: 'Order delivered successfully', order: updateOrder});

}


export const markOrderAsDelivered = async (req, res, next) =>
{
    const { orderId }= req.params;

    req.savedDocuments.push({model: Order, _id: orderId, method: 'edit'});

    const updateOrder = await Order.findOneAndUpdate({
        _id: orderId,
        orderStatus: 'Shipped',
        isDelivered: false
    },{
        orderStatus: 'Delivered',
        deliveredAt: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
        deliveredBy: req.authUser._id,
        isDelivered: true
    },
    {
        new: true
    })

   if(!updateOrder) return next({message: 'Order not found or cannot be delivered', cause: 404});

    res.status(200).json({success: true, message: 'Order delivered successfully', order: updateOrder});
}


export const cancelOrder = async (req, res, next) =>
{
    const { orderId } = req.params
    const { _id } = req.authUser

    req.savedDocuments.push({model: Order, _id: orderId, method: 'edit'});

    const order = await Order.findOneAndUpdate(
    {
        _id: orderId,
        orderStatus: {$in: ['pending', 'placed']}
    },{
        orderStatus: 'Cancelled',
        cancelledBy: _id,
        cancelledAt: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
    },
    {
        new: true
    })

    if(!order) return next({message: 'Order not found or cannot be cancelled', cause: 404});

    res.status(200).json({success: true, message: 'Order cancelled successfully', order})

}