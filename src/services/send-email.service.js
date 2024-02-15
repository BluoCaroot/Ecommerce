

// send email service

import nodemailer from 'nodemailer'


const sendEmailService = async (
{
    to = '', 
    subject = 'no-reply',
    message = '<h1>no-message</h1>',
    attachments = []
}) =>
{
    const transporter = nodemailer.createTransport(
    {
        host: 'smtp.gmail.com', 
        service: 'gmail',
        port: 587,
        secure: false,
        auth: 
        {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const info = await transporter.sendMail(
    {
        from: `"Ecommerce site" <${process.env.EMAIL}>`, 
        to, 
        subject, 
        html: message, 
        attachments
    })
    
    return ((info.accepted.length) ? true : false)
}


export default sendEmailService