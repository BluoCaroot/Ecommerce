
import mongoose, { Schema, model } from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";

const userSchema = new Schema(
{
    username:
    {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        tirm: true,
        lowercase: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true,
        tirm: true,
        lowercase: true
    },
    password:
    {
        type: String,
        required: true,
        minlength: 8,
    },
    phoneNumbers:
    [{
        type: String,
        required: true,
    }],
    addresses:
    [{
        type: String,
        required: true
    }],
    role:
    {
        type: String,
        enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN, systemRoles.DELIVERY_PERSON],
        default: systemRoles.USER
    },
    isEmailVerified:
    {
        type: Boolean,
        default: false
    },
    age:
    {
        type: Number,
        min: 18,
        max: 100
    },
    isDeleted: { type: Boolean, default: false },
    token: { type: String }

}, { timestamps: true })



export default mongoose.models.User || model('User', userSchema)