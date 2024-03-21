import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema(
{
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    productId: {type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},
    rating: {type: Number, required: true, enum: [1, 2, 3, 4, 5]},
    review: {type: String, required: true},
    isDeleted: {type: Boolean, default: false}

},
{
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

export default mongoose.models.Review || mongoose.model("Review", reviewSchema)

