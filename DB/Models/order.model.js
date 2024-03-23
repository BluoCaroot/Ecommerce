import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
{
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems:
    [{
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
    }],
    shippingAddress:
    {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    phoneNumber:
    {
        type: String,
        required: true
    },
    shippingPrice:
    {
        type: Number,
        required: true,
    },
    coupon:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    },
    totalPrice:
    {
        type: Number,
        required: true,
    },
    paymentMethod:
    {
        type: String,
        enum: ['Cash' ,'Stripe'],
        required: true,
    },
    paymentIntent: String,
    orderStatus:
    {
        type: String,
        enum: ['Pending', 'Placed', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
        required: true,
        default: 'Pending'
    },
    isPaid:
    {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt:
    {
        type: Date
    },
    isRefunded:
    {
        type: Boolean,
        required: true,
        default: false
    },
    refundedAt:
    {
        type: Date
    },
    isDelivered:
    {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt:
    {
        type: Date
    },
    cancelledAt:
    {
        type: Date
    },
    canceledBy:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true})


export default mongoose.models.Order ||  mongoose.model('Order', orderSchema) 