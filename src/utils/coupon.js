import { DateTime } from 'luxon';
import Coupon from  '../../DB/Models/coupon.model.js';
import CouponUsers from  '../../DB/Models/coupon-users.model.js';

export const couponValidation = async (couponCode , userId) =>{

    const coupon = await Coupon.findOne({couponCode});
    if(!coupon) return {error: true, message: 'Coupon not found', status: 404};
    
    if(coupon.couponStatus === 'expired'|| 
       DateTime.fromISO(coupon.toDate) < DateTime.now()
    ) return {error: true, message: 'Coupon is expired', status: 400};


    if( DateTime.fromISO(coupon.fromDate) > DateTime.now() )
     return {error: true, message: 'Coupon is not started yet', status: 400};


    const isUserAssigned = await CouponUsers.findOne({couponId:coupon._id, userId});
    if(!isUserAssigned) return {error: true, message: 'Coupon is not assigned to you', status: 400};

    if(isUserAssigned.usageCount >= isUserAssigned.maxUsage) return {error: true, message: 'Coupon exceeded the max usage', status: 400};

    return coupon
}

export const applyCoupon = (coupon, totalPrice) =>
{
    if (!coupon) return totalPrice;
    const {isFixed, isPercentage, couponAmount} = coupon;

    if (isFixed && couponAmount > totalPrice)
        return null
    
    if(isFixed) return totalPrice - couponAmount;
    if(isPercentage) return totalPrice - (totalPrice * (couponAmount / 100));
}