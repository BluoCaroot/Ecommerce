import db_connection from "../DB/connection.js"
import { globalResponse } from "./middlewares/global-response.middleware.js"
import { init } from "./middlewares/init.js"
import { rollbackSavedDocuments } from "./middlewares/rollback-saved-documnets.middleware.js"
import { rollbackUploadedFiles } from "./middlewares/rollback-uploaded-files.middleware.js"

import * as  routers from './modules/index.routes.js'
import { detectExpiredCoupons, detectUnconfirmedOrders } from "./utils/crons.js"


export const initiateApp = (app, express) => {

    const port = process.env.PORT


    app.use(express.json())

    db_connection()
    app.use(init)
    app.use('/auth', routers.authRouter)
    app.use('/user', routers.userRouter)
    app.use('/category', routers.categoryRouter)
    app.use('/subCategory', routers.subCategoryRouter)
    app.use('/brand', routers.brandRouter)
    app.use('/product', routers.productRouter)
    app.use('/cart', routers.cartRouter)
    app.use('/coupon', routers.couponRouter)
    app.use('/order', routers.orderRouter)
    app.use('/review', routers.reviewRouter)

    app.use(globalResponse, rollbackUploadedFiles, rollbackSavedDocuments)

    detectExpiredCoupons()
    detectUnconfirmedOrders()
    app.listen(port, () => console.log(`server started on port ${port}`))

}