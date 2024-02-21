import mongoose, { Schema, model } from "mongoose"

import cloudinaryConnection from "../../src/utils/cloudinary.js"


const categorySchema = new Schema(
{
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    Image: {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true }
    },
    folderId: { type: String, required: true, unique: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // superAdmin
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // superAdmin
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

categorySchema.virtual('subcategories', 
{
    ref: 'SubCategory',
    localField: '_id',
    foreignField: 'categoryId',
    
})

categorySchema.pre('findOneAndDelete', async function(next)
{
    const conditions = this.getQuery(); 
    const categoryId = conditions._id;
    const {folderId} = await mongoose.models.Category.findById(categoryId)
    
    await mongoose.models.SubCategory.deleteMany({ categoryId })
    await mongoose.models.Brand.deleteMany({ categoryId })
    await mongoose.models.Product.deleteMany({ categoryId })
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${folderId}`)
    next()
})



export default mongoose.models.Category || model('Category', categorySchema)


