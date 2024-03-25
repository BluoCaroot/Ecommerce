import CouponUsers from "../../../DB/Models/coupon-users.model.js";
import Coupon  from "../../../DB/Models/coupon.model.js";
import User from "../../../DB/Models/user.model.js";
import { APIFeatures } from "../../utils/api-features.js";





/**
 * @param {*} req.body  { couponCode , couponAmount , fromDate, toDate , isFixed , isPercentage, Users}
 * @param {*} req.authUser  { _id:userId} 
 * @returns  {message: "Coupon added successfully",coupon, couponUsers}
 * @description create coupon and couponUsers
 * 
 */
export const addCoupon = async (req, res, next) => 
{
    const { couponCode , couponAmount,
        fromDate, toDate, isFixed,
        isPercentage, Users} = req.body
    const {_id: addedBy} = req.authUser;
    
    if (!(isFixed || isPercentage))
        return (next({cause: 400, message: 'isFixed or isPercentage is required'}));

    const CouponExists = await Coupon.findOne({couponCode});
    if (CouponExists)
        return (next({cause: 400, message: 'Coupon already exists'}));
    
    if (isPercentage && couponAmount > 100)
            return (next({cause: 400, message: 'Percentage should be less than 100'}));
    
    const couponObj =
    {
        couponCode,
        couponAmount,
        fromDate,
        toDate,
        isFixed,
        isPercentage,
        addedBy
    }
    const coupon = await Coupon.create(couponObj);
    if (!coupon)
        return (next({cause: 500, message: 'Error creating coupon'}));
    req.savedDocuments.push({model: Coupon, _id: coupon._id, method: 'add'});
    
    const userIds = [];
    for (const user of Users)
        userIds.push(user.userId);
    
    const usersExist = await User.find({_id:{$in:userIds}})
    if (usersExist.length != Users.length)
        return (next({cause: 400, message: 'User not found'}));
    
    const couponUsers = await CouponUsers.create(
        Users.map(ele => ({...ele, couponId: coupon._id}))
    )
    if (!couponUsers)
        return (next({cause: 500, message: 'Error creating coupon users'}));
    req.savedDocuments.push({model: CouponUsers, _id: couponUsers._id, method: 'add'});
    res.status(201).json({message: "Coupon added successfully",coupon, couponUsers});
}

/**
 * 
 * @param {*} params { id } 
 * @param {*} body { couponCode , couponAmount , fromDate, toDate , isFixed , isPercentage, Users} 
 * @returns { message: "coupon updated successfully", data: updatedCoupon }
 * @description updates coupon
 * 
 */
export const updateCoupon = async (req, res, next) =>
{
    const { couponId } = req.params;
    const { couponAmount,
        fromDate, toDate, isFixed,
        isPercentage} = req.body
    const {_id: updatedBy} = req.authUser;
    
    if (!(isFixed || isPercentage))
        return (next({cause: 400, message: 'isFixed or isPercentage is required'}));
    if (isPercentage && couponAmount > 100)
        return (next({cause: 400, message: 'Percentage should be less than 100'}));

    const coupon = await Coupon.findById(couponId);
    if (!coupon)
        return (next({cause: 400, message: 'Coupon not found'}));
    
    if (coupon.addedBy.toString() !== updatedBy.toString())
        return (next({cause: 403, message: 'You are not authorized to update this coupon'}));

    
    req.savedDocuments.push({model: Coupon, _id: coupon._id, method: 'edit'});
    coupon.couponAmount = couponAmount ? couponAmount : coupon.couponAmount;
    coupon.fromDate = fromDate ? fromDate : coupon.fromDate;
    coupon.toDate = toDate ? toDate : coupon.toDate;
    coupon.isFixed = isFixed ? isFixed : coupon.isFixed;
    coupon.isPercentage = isPercentage ? isPercentage : coupon.isPercentage;
    coupon.updatedBy = updatedBy;
    
    const updatedCoupon = await coupon.save();
    if (!updatedCoupon)
        return (next({cause: 500, message: 'Error updating coupon'}));
    res.status(200).json({success: true, message: "Coupon updated successfully", data: updatedCoupon});

}


/**
 * 
 * @param {*} params { id }  
 * @returns { message: "Coupon toggeled successfully" }
 * @description disables / enables coupon
 * 
 */
export const toggleCoupon = async (req, res, next) =>
{
    const { couponId } = req.params;
    const {_id} = req.authUser
    const coupon = await Coupon.findById(couponId);

    if (!coupon)
        return (next({cause: 400, message: 'Coupon not found'}));

    coupon.status = coupon.status === 'valid' ? 'expired' : 'valid';
    if (coupon.status === 'valid')
        coupon.enabledBy = _id;
    else
        coupon.disabledBy = _id;
    const toggeledCoupon = await coupon.save();
    if (!toggeledCoupon)
        return (next({cause: 500, message: 'Error toggeling coupon'}));

    res.status(200).json({success: true, message: 'Coupon toggeled successfully'});
}

/**
 * 
 * @param {*} query { type, id } 
 * @returns coupon or list of coupons
 * @description get coupon by id or list of enabled or disbaled coupons
 */
export const getCoupons = async (req, res, next) =>
{
    const { sortBy, size, page, filter } = req.query;

    const features = new APIFeatures(Coupon.find())
                    .sort(sortBy)
                    .pagination({size, page})
                    .filters(filter);

    const coupons = await features.mongooseQuery
    if (!coupons || !coupons.length)
        return (next({cause: 404, message: 'Coupons not found'}));
    res.status(200).json({success: true, message: `list of coupons`, data: coupons});
}

export const getCoupon = async (req, res, next) =>
{
    const { couponId } = req.params;
    const coupon = await Coupon.findById(couponId);
    if (!coupon)
        return (next({cause: 400, message: 'Coupon not found'}));
    res.status(200).json({success: true, message: 'Coupon found', data: coupon});
}
