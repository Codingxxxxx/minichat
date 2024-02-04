const nodemailer = require('nodemailer');
const { AppConfig } = require('../const');

const mail = nodemailer.createTransport({
  host: AppConfig.SMTP_HOST,
  port: AppConfig.SMTP_PORT,
  secure: AppConfig.SMTP_PORT === '465' ? true : false,
  auth: {
    user: AppConfig.SMTP_USER,
    pass: AppConfig.SMTP_PASS
  }
})

module.exports = mail;