import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from "../../../DB/Models/user.model.js"
import sendEmailService from "../../services/send-email.service.js"




export const signUp = async (req, res, next) => {
    const { username, email, password, age, phoneNumbers, addresses } = req.body

    const isEmailDuplicated = await User.findOne({ email })

    if (isEmailDuplicated)
        return next(new Error('Email already exists,Please use another email or sigin in if you already have an account', { cause: 409 }))

    const usertoken = jwt.sign({ email },
        process.env.JWT_SECRET_VERFICATION,
        { expiresIn: '5m' })
    const isEmailSent = await sendEmailService(
    {
        to: email,
        subject: 'Email Verification',
        message: `<h2>please click on this link to verfiy your email</h2>
        <a href="${req.protocol}://${req.headers.host}/auth/verify-email?token=${usertoken}">Verify Email</a>`
    })

    if (!isEmailSent) 
        return next(new Error('An error occured, please try again later', { cause: 500 }))
    
    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)


    const newUser = await User.create({ username, email, password: hashedPassword, age, phoneNumbers, addresses })
    req.savedDocuments.push({ model: User, _id: newUser._id, method: "add"})

    res.status(201).json(
    {
        success: true,
        message: 'User created successfully, please check your email to verify your account',
        data: newUser
    })
}

export const verifyEmail = async (req, res, next) => 
{
    const { token } = req.query

    const decodedData = jwt.verify(token, process.env.JWT_SECRET_VERFICATION)

    const user = await User.findOne({ email: decodedData.email, isEmailVerified: false })
    if (!user)
        return next(new Error('User not found', { cause: 404 }))

    req.savedDocuments.push({ model: User, _id: user._id, method: "update", old: user.toObject()})

    user.isEmailVerified = true
    const updatedUser = await user.save()
    if (!updatedUser)
        return next(new Error('An error occured, please try again later', { cause: 500 }))

    res.status(200).json({
        success: true,
        message: 'Email verified successfully'
    })
}

export const signIn = async (req, res, next) => 
{
    const { email, password } = req.body

    const user = await User.findOne({ email, isEmailVerified: true })

    if (!user)
        return next(new Error('Invalid login credentails', { cause: 404 }))
    
    const isPasswordCorrect = bcrypt.compareSync(password, user.password)
    if (!isPasswordCorrect) 
        return next(new Error('Invalid login credentails', { cause: 404 }))
    

    const token = jwt.sign({ email, id: user._id, loggedIn: true }, process.env.JWT_SECRET_LOGIN, { expiresIn: '1d' })

    user.token = token
    const updatedUser = await user.save()
    if (!updatedUser)
        return next(new Error('An error occured, please try again later', { cause: 500 }))
    
    res.status(200).json(
    {
        success: true,
        message: 'User logged in successfully',
        data: { token: process.env.TOKEN_PREFIX + token }
    })
}

export const resendEmail = async (req, res, next) =>
{
    const {email} = req.body

    const doesUserExist = await User.findOne({email, isEmailVerified: false})
    if (!doesUserExist)
        return next(new Error('user doesn\'t exist or already verified', { cause: 409 }))

    const usertoken = jwt.sign({ email },
        process.env.JWT_SECRET_VERFICATION,
        { expiresIn: '5m' })
    
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
        message: "sent verification email"
    })
}

export const forgetPassword = async (req, res, next) =>
{
    const { email } = req.body

    const user =  await User.findOne({email, isEmailVerified: true})
    if (!user)
        return next(new Error('User not found', { cause: 404 }))
    
    const usertoken = jwt.sign({ email },
        process.env.JWT_SECRET_FORGETPASSWORD,
        { expiresIn: '2m' })
    const isEmailSent = await sendEmailService(
    {
        to: email,
        subject: 'Password Reset',
        message: `<h2>Please use this code to reset your password</h2>
        <h3>${usertoken}</h3>`
    })
    if (!isEmailSent) 
        return next(new Error('An error occured, please try again later', { cause: 500 }))
    res.status(200).json(
    {
        success: true,
        message: "please check your email to reset your password"
    })
}

export const resetPassword = async (req, res, next) =>
{
    const { token, password } = req.body

    const decodedData = jwt.verify(token, process.env.JWT_SECRET_FORGETPASSWORD)

    const user = await User.findOne({ email: decodedData.email, isEmailVerified: true })
    if (!user)
        return next(new Error('incorrect code', { cause: 404 }))

    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)

    req.savedDocuments.push({ model: User, _id: user._id, method: "update", old: user.toObject()})

    user.password = hashedPassword
    const updatedUser = await user.save()
    if (!updatedUser)
        return next(new Error('An error occured, please try again later', { cause: 500 }))

    res.status(200).json({
        success: true,
        message: 'Password reset successfully, you can now login with your new password'
    })
}