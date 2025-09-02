/**
 * Email templates utility
 * Contains different email templates for various purposes
 */

/**
 * Get email template based on template name
 * @param {string} templateName - Name of the template to use
 * @param {Object} data - Data to populate in the template
 * @returns {string} - HTML content of the email
 */
const getEmailTemplate = (templateName, data) => {
    // Common header and footer for all emails
    const header = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                border: 1px solid #e1e1e1;
                border-radius: 5px;
                padding: 20px;
            }
            .logo {
                text-align: center;
                margin-bottom: 20px;
            }
            .btn {
                display: inline-block;
                background-color: #4CAF50;
                color: #fff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                margin: 20px 0;
            }
            .otp {
                display: inline-block;
                background-color: #c5c5c5;
                color: rgb(0, 0, 0);
                font-weight: 700;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                margin: 20px 0;
                letter-spacing: .1rem;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <h2>Home Services Directory</h2>
            </div>
    `;

    const footer = `
            <div class="footer">
                <p>© ${new Date().getFullYear()} Home Services Directory. All rights reserved.</p>
                <p>If you didn't request this email, please ignore it or contact support.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Select template based on name
    let content = '';

    switch (templateName) {
        case 'verification':
            content = verificationTemplate(data);
            break;
        case 'resetPassword':
            content = resetPasswordTemplate(data);
            break;
        case 'welcome':
            content = welcomeTemplate(data);
            break;
        case 'providerApproval':
            content = providerApprovalTemplate(data);
            break;
        default:
            content = `<p>No template found for "${templateName}"</p>`;
    }

    return header + content + footer;
};

/**
 * Email verification template
 */
const verificationTemplate = (data) => {
    return `
    <h3>Verify Your Email Address</h3>
    <p>Hello ${data.name},</p>
    <p>Thank you for registering with Home Services Directory. To complete your registration and verify your email address, please copy the code below:</p>
    <p class="otp">${data.verificationCode}</p>
    <p>This link will expire in 5 min.</p>
    <p>Welcome aboard!</p>
    `;
};

/**
 * Reset password template
 */
const resetPasswordTemplate = (data) => {
    return `
    <h3>Reset Your Password</h3>
    <p>Hello ${data.name},</p>
    <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <p>
        <a href="${data.resetUrl}" class="btn">Reset Password</a>
    </p>
    <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
    <p>${data.resetUrl}</p>
    <p>This link will expire in 1 hour for security reasons.</p>
    `;
};

/**
 * Welcome template (sent after email verification)
 */
const welcomeTemplate = (data) => {
    return `
    <h3>Welcome to Home Services Directory!</h3>
    <p>Hello ${data.name},</p>
    <p>Thank you for verifying your email. Your account is now fully activated!</p>
    <p>With Home Services Directory, you can:</p>
    <ul>
        <li>Find trusted service providers in your area</li>
        <li>Browse through different service categories</li>
        <li>Get in touch with professionals for your home service needs</li>
    </ul>
    <p>
        <a href="${data.loginUrl}" class="btn">Log In to Your Account</a>
    </p>
    <p>We're excited to have you on board!</p>
    `;
};

/**
 * Provider approval template
 */
const providerApprovalTemplate = (data) => {
    return `
    <h3>Your Provider Account Has Been Approved!</h3>
    <p>Hello ${data.name},</p>
    <p>Great news! Your service provider account for "${data.businessName}" has been reviewed and approved.</p>
    <p>Your business profile is now visible to all users on our platform.</p>
    <p>
        <a href="${data.dashboardUrl}" class="btn">Go to Provider Dashboard</a>
    </p>
    <p>From your dashboard, you can:</p>
    <ul>
        <li>Manage your business profile</li>
        <li>Update your service offerings</li>
        <li>View contact requests from potential customers</li>
    </ul>
    <p>Thank you for joining our network of trusted service providers!</p>
    `;
};

module.exports = { getEmailTemplate };