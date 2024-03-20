import { scheduleJob } from "node-schedule"
import { DateTime } from "luxon"

import Order from "../../DB/Models/order.model.js"
import Coupon from "../../DB/Models/coupon.model.js"


export function detectExpiredCoupons()
{
    scheduleJob("0 0 * * *", async () => {
		console.log("running")
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