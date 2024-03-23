import Stripe from 'stripe'
import Coupon from '../../DB/Models/coupon.model.js'


export const createCheckoutSession = async (
    {
        customer_email,
        metadata,
        discounts,
        line_items
    }) =>
{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const paymentData = await stripe.checkout.sessions.create(
    {
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email,
        metadata,
        success_url: `http://${process.env.SUCCESS_URL}`,
        cancel_url: `http://${process.env.CANCEL_URL}`,
        discounts,
        line_items
    })
    return paymentData
}

export const createCoupon = async (
    {
        couponId,

    }) =>
{
    const coupon = await Coupon.findById(couponId)
    if (!coupon) return ({ message: 'Coupon not found', fail: true })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const couponObj = { name: coupon.couponCode }

    if (coupon.isFixed)
        couponObj.amount_off = coupon.couponAmount * 100, couponObj.currency = 'EGP'
    else
        couponObj.percent_off = coupon.couponAmount

    const StripeCoupon = await stripe.coupons.create(couponObj)

    return StripeCoupon
}

export const createPaymentMethod = async ({token}) =>
{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const paymentMethod = await stripe.paymentMethods.create(
    {
        type: 'card',
        card: { token }
    })
    return paymentMethod
}

export const createPaymentIntent = async (
    {
        amount,
        currency
    }
) =>
{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const paymentMethod = await createPaymentMethod({token: 'tok_visa'})
    const paymentIntent = await stripe.paymentIntents.create(
    {
        amount: amount * 100,
        currency,
        automatic_payment_methods: 
        {
            enabled: true,
            allow_redirects: 'never'
        },
        payment_method: paymentMethod.id,
    })
    return paymentIntent
}

export const retrievePaymentIntent = async ({paymentIntentId}) =>
{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
}

export const confirmPaymentIntent = async({paymentIntentId}) =>
{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const paymentDetails = await retrievePaymentIntent({paymentIntentId})
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId,
        {payment_method: paymentDetails.payment_method})
    return paymentIntent
}

export const refundPaymentIntent = async({paymentIntentId}) =>
{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const paymentIntent = await stripe.refunds.create({payment_intent: paymentIntentId})
    return paymentIntent
}