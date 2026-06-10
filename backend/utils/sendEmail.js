const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html: html || `<p>${text}</p>`,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  logger.info(`Email sent to ${to}: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
