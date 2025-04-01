const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'Gmail', // Use your email provider (e.g., Gmail, SendGrid)
      auth: {
        user: process.env.EMAIL_USER, // Set this in `.env`
        pass: process.env.EMAIL_PASS, // Set this in `.env`
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

module.exports = sendEmail;
