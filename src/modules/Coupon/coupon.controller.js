import CouponUsers from "../../../DB/Models/coupon-users.model.js";
import Coupon  from "../../../DB/Models/coupon.model.js";
import User from "../../../DB/Models/user.model.js";





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
    res.status(200).json({message: "Coupon updated successfully", data: updatedCoupon});

}


/**
 * 
 * @param {*} params { id }  
 * @returns { message: "Coupon deleted successfully" }
 * @description deletes coupon
 * 
 */
export const deleteCoupon = async (req, res, next) =>
{
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon)
        return (next({cause: 400, message: 'Coupon not found'}));

    req.savedDocuments.push({model: Coupon, _id: coupon._id, method: 'delete'});
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    if (!deletedCoupon)
        return (next({cause: 500, message: 'Error deleting coupon'}));

    res.status(200).json({message: 'Coupon deleted successfully'});
}

/**
 * 
 * @param {*} query { type, id } 
 * @returns coupon or list of coupons
 * @description get coupon by id or list of enabled or disbaled coupons
 */


export const getCoupons = async (req, res, next) =>
{
    const { type, id } = req.query;

    if (id)
    {
        const coupon = await Coupon.findById(id);
        if (!coupon)
            return (next({cause: 400, message: 'Coupon not found'}));
        res.status(200).json({message: 'Coupon found', data: coupon});
    }

    const coupons = await Coupon.find({status: type});
    if (!coupons)
        return (next({cause: 500, message: 'Error fetching coupons'}));
    res.status(200).json({message: `list of ${type} coupons`, data: coupons});
}
