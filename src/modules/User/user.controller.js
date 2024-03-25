import bcrypt from 'bcrypt'
import jwt  from 'jsonwebtoken'

import User from "../../../DB/Models/user.model.js"
import sendEmailService from '../../services/send-email.service.js'
import * as deletion from '../../utils/deletion.js'

export const updateUser = async (req, res, next) =>
{
    const { username, age, phoneNumbers, addresses } = req.body
    const { authUser } = req

    const user = await User.findById(authUser._id)

    req.savedDocuments.push({ model: User, _id: user._id, method: "edit", old: user.toObject()})

    user.username = username ? username : user.username
    user.age = age ? age : user.age
    user.phoneNumbers = phoneNumbers ? phoneNumbers : user.phoneNumbers
    user.addresses = addresses ? addresses: user.addresses

    await user.save()
    res.status(200).json(
    {
        success: true,
        message: 'User updated successfully',
    })
}

export const changeEmail = async (req, res, next) =>
{
    const { email, password } = req.body
    const { authUser } = req

    const user = await User.findById(authUser._id)
    
    const isPasswordCorrect = bcrypt.compareSync(password, user.password)
    if (!isPasswordCorrect) 
        return next(new Error('Invalid password', { cause: 404 }))

    if (email == user.email) 
        return next({ cause: 400, message: 'Please enter different email from the existing one.' })

    const isEmailDuplicated = await User.findOne({ email })

    if (isEmailDuplicated)
        return next(new Error('Email already exists, Please use another email', { cause: 409 }))
    
    req.savedDocuments.push({ model: User, _id: user._id, method: "edit", old: user.toObject})
    user.email = email
    user.isEmailVerified = false
    await user.save()
    const usertoken = jwt.sign({ email }, process.env.JWT_SECRET_VERFICATION, { expiresIn: '2m' })
        
    const isEmailSent = await sendEmailService(
    {
        to: email,
        subject: 'Email Verification',
        message: `<h2>please click on this link to verfiy your email</h2>
        <a href="${req.protocol}://${req.headers.host}/auth/verify-email?token=${usertoken}">Verify Email</a>`
    })

    if (!isEmailSent) 
        return next(new Error('An error occured, please try again later', { cause: 500 }))
    

    res.status(200).json(
    {
        success: true,
        message: 'Email address updated successfully, please check your inbox to verify it',
    })
}

export const changePassword = async (req, res, next) =>
{
    const {authUser} = req
    const {password, oldPassword} = req.body

    const user = await User.findById(authUser._id)

    const isPasswordCorrect = bcrypt.compareSync(oldPassword, user.password)

    if (!isPasswordCorrect)
        return next(new Error('Incorrect password', {cause: 400}))

    if (password == oldPassword) 
        return next({ cause: 400, message: 'Please enter different password from the existing one.' })

    req.savedDocuments.push({ model: User, _id: user._id, method: "edit", old: user.toObject()})
    
    user.password = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)
    await user.save()
    res.status(200).json(
    {
        success: true,
        message: "password changed successfully"
    })
}

export const deleteUser = async (req, res, next) =>
{
    const { authUser } = req
    const { password } = req.body

    const user = await User.findById(authUser._id)
    const isPasswordCorrect = bcrypt.compareSync(password, user.password)
    
    if (!isPasswordCorrect)
        return next(new Error('Incorrect password', {cause: 400}))
    
    const userDeleted = await deletion.deleteUser({userId: user._id, req})
    if (!userDeleted) 
        return next(new Error('Error deleting user', {cause: 500}))
    res.status(200).json(
    {
        success: true,
        message: "user deleted successfully"
    })
}

export const getUserProfile = async (req, res, next) =>
{
    const { id } = req.params
    const user = await User.findById(id)

    if (!user || user.isDeleted)
        return next(new Error('User not found', { cause: 404 }))

    let ret = {}
    ret.username = user.username
    ret.age = user.age
    ret.phoneNumbers = user.phoneNumbers
    ret.addresses = user.addresses
    ret.role = user.role

    if (req.authUser && req.authUser._id.toString() == id)
        ret = user

    res.status(200).json(
    {
        success: true,
        message: "user profile",
        data: ret
    })
}
