import mongoose from "mongoose"

const couponSchema = new mongoose.Schema(
{
    couponCode:
    {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    couponAmount:
    {
        type: Number,
        required: true
    },
    status:
    {
        type: String,
        enum: ['valid', 'expired'],
        default: 'valid'
    },
    isFixed:
    {
        type: Boolean,
        default: false
    },
    isPercentage:
    {
        type: Boolean,
        default: false
    },
    fromDate:
    {
        type: String,
        required: true
    },
    toDate:
    {
        type: String,
        required: true
    },
    enabledAt:
    {
        type: Date
    },
    disabledAt:
    {
        type: Date
    },
    addedBy:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    disabledBy:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    enabledBy:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true})

couponSchema.pre('save', function(next)
{
    
    if (this.isModified('status') && this.status === 'valid')
        this.enabledAt = Date.now();
    if (this.isModified('status') && this.status === 'expired')
        this.disabledAt = Date.now();
    next();
})

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema)