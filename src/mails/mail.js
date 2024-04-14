import nodemailer from 'nodemailer'
import { config } from '../config/config.js'


const transport = nodemailer.createTransport(
    {
        service: 'gmail',
        port: 587,
        auth:{
            user: config.EMAIL_SENDER,
            pass: config.EMAIL_SENDER_PASSWORD
        }
    }
)

export const sendEmail = (to, subject, message) => {
    return transport.sendMail({
        to, subject, html:message
    })
}