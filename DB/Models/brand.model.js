import mongoose, { Schema, model } from "mongoose"




const brandSchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    Image: {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true }
    },
    folderId: { type: String, required: true, unique: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isDeleted: { type: Boolean, default: false },
    imagesDeleted: { type: Boolean, default: false }
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

brandSchema.virtual('products',
{
    ref: 'Product',
    localField: '_id',
    foreignField: 'brandId'
})


export default mongoose.models.Brand || model('Brand', brandSchema)
