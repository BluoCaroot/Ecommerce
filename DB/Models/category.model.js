import mongoose, { Schema, model } from "mongoose"



const categorySchema = new Schema(
{
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
    isDeleted: { type: Boolean, default: false },
    imagesDeleted: { type: Boolean, default: false }

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



export default mongoose.models.Category || model('Category', categorySchema)


