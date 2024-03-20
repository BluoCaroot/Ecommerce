import mongoose, { Schema, model } from "mongoose"




const subCategorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    Image: {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true }
    },
    folderId: { type: String, required: true, unique: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },  
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, 
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' }, 
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

    isDeleted: { type: Boolean, default: false },
    imagesDeleted: { type: Boolean, default: false }


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

export default mongoose.models.SubCategory || model('SubCategory', subCategorySchema)
