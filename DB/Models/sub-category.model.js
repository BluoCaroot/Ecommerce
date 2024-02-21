import mongoose, { Schema, model } from "mongoose"

import cloudinaryConnection from "../../src/utils/cloudinary.js";



const subCategorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    Image: {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true }
    },
    folderId: { type: String, required: true, unique: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // superAdmin
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // superAdmin
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

subCategorySchema.virtual('brands', {
    ref: 'Brand',
    localField: '_id',
    foreignField: 'subCategoryId',
})

subCategorySchema.pre('findOneAndDelete', async function(next)
{
    const conditions = this.getQuery(); 
    const subCategoryId = conditions._id;
    const { Image } = await mongoose.models.SubCategory.findById(subCategoryId)

    const lastIndex = Image.public_id.lastIndexOf("/");
    const path = Image.public_id.substring(0, lastIndex);


    await mongoose.models.Brand.deleteMany({ subCategoryId })
    await mongoose.models.Product.deleteMany({ subCategoryId })
    await cloudinaryConnection().api.delete_resources_by_prefix(`${path}`)
    await cloudinaryConnection().api.delete_folder(`${path}`)
    next()
})
export default mongoose.models.SubCategory || model('SubCategory', subCategorySchema)
