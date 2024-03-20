import { scheduleJob } from "node-schedule"
import Coupon from "../../DB/Models/coupon.model.js"
import { DateTime } from "luxon"


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