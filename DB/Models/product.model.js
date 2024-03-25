import mongoose, { Schema, model } from "mongoose";

const productSchema = new Schema({
    title: { type: String, required: true, trim: true },
    desc: String,
    slug: { type: String, required: true, trim: true },  
    folderId: { type: String, required: true, unique: true },


    basePrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    appliedPrice: { type: Number, required: true },
    stock: { type: Number, required: true, min: 0 },
    rate: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },

    Images: [{
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true }
    }],

    specs: {
        type: Map,
        of: [String | Number]
    },

    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },

    isDeleted: { type: Boolean, default: false },
    imagesDeleted: { type: Boolean, default: false }


},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.virtual('Reviews', 
{
    ref: 'Review',
    localField: '_id',
    foreignField: 'productId'
})


export default mongoose.models.Product || model('Product', productSchema)
