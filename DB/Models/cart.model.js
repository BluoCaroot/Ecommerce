import mongoose from 'mongoose'

const cartSchema = new mongoose.Schema(
{
    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products:
    [{
        productId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity:
        {
            type: Number,
            required: true,
            min: 1
        },
        basePrice:
        {
            type: Number,
            required: true
        },
        finalPrice:
        {
            type: Number,
            required: true
        },
        title:
        {
            type: String,
            required: true
        }
    }],
    subTotal:
    {
        type: Number,
        required: true,
    }
})

cartSchema.pre('save', async function(next)
{
    const cart = this;
    let total = 0;
    for (const product of cart.products)
    {
        product.finalPrice = product.basePrice * product.quantity
        total += product.finalPrice
    }
    cart.subTotal = total;
    next()
})


export default mongoose.models.Cart || mongoose.model('Cart', cartSchema)