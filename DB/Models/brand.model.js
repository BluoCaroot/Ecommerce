import mongoose, { Schema, model } from "mongoose"

import cloudinaryConnection from "../../src/utils/cloudinary.js";



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
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
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

brandSchema.pre('findOneAndDelete', async function(next)
{
    const conditions = this.getQuery(); 
    const brandId = conditions._id;
    const  { Image }  = await mongoose.models.Brand.findById(brandId)

    const lastIndex = Image.public_id.lastIndexOf("/");
    const path = Image.public_id.substring(0, lastIndex);

    await mongoose.models.Product.deleteMany({ brandId })
    await cloudinaryConnection().api.delete_resources_by_prefix(`${path}`)
    await cloudinaryConnection().api.delete_folder(`${path}`)
    
    next()
})

export default mongoose.models.Brand || model('Brand', brandSchema)
