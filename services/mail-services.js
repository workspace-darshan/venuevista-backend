const nodemailer = require("nodemailer");
const { getEmailTemplate } = require("./EmailTemplates");

const mailService = async (to, subject, templateName, data) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || "mevadadarshan2002@gmail.com",
            pass: process.env.EMAIL_PASSWORD || "asdasdaffrggr",
        },
    });

    try {
        // Get the appropriate HTML template based on template name
        const htmlContent = getEmailTemplate(templateName, data);

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Venue Booking Services 🏠" <noreply@homeservices.com>',
            to,
            subject,
            priority: "high",
            html: htmlContent,
        });
        console.log(`Email sent: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error("Error sending email:", err);
        throw err;
    }
};
module.exports = { mailService };