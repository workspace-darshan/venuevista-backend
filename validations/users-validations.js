const { handleError } = require("../utils/common_utils");

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (basic international format)
const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;

// Validate registration input
const validateRegistration = (req, res, next) => {
    const { firstName, lastName, email, phone, password } = req.body;
    const errors = [];

    // Check required fields
    if (!firstName?.trim()) errors.push("First name is required");
    if (!lastName?.trim()) errors.push("Last name is required");
    if (!email?.trim()) errors.push("Email is required");
    if (!phone?.trim()) errors.push("Phone is required");
    if (!password) errors.push("Password is required");

    // Validate formats
    if (email && !emailRegex.test(email)) {
        errors.push("Invalid email format");
    }

    if (phone && !phoneRegex.test(phone)) {
        errors.push("Invalid phone number format");
    }

    if (password && password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }

    // Check name lengths
    if (firstName && firstName.trim().length < 2) {
        errors.push("First name must be at least 2 characters long");
    }

    if (lastName && lastName.trim().length < 2) {
        errors.push("Last name must be at least 2 characters long");
    }

    if (errors.length > 0) {
        return handleError(res, "Validation failed", 400, errors);
    }

    // Trim whitespace
    req.body.firstName = firstName.trim();
    req.body.lastName = lastName.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.phone = phone.trim();

    next();
};

// Validate login input
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email?.trim()) errors.push("Email is required");
    if (!password) errors.push("Password is required");

    if (email && !emailRegex.test(email)) {
        errors.push("Invalid email format");
    }

    if (errors.length > 0) {
        return handleError(res, "Validation failed", 400, errors);
    }

    req.body.email = email.trim().toLowerCase();

    next();
};

// Validate update profile input
const validateUpdateProfile = (req, res, next) => {
    const { firstName, lastName, email, phone } = req.body;
    const errors = [];

    // Check if at least one field is provided
    if (!firstName && !lastName && !email && !phone) {
        return handleError(res, "At least one field must be provided for update", 400);
    }

    // Validate formats if provided
    if (email && !emailRegex.test(email)) {
        errors.push("Invalid email format");
    }

    if (phone) {
        const phoneStr = String(phone).trim();
        if (!phoneRegex.test(phoneStr)) {
            errors.push("Invalid phone number format");
        }
        req.body.phone = phoneStr;
    }
    // Check lengths if provided
    if (firstName && firstName.trim().length < 2) {
        errors.push("First name must be at least 2 characters long");
    }

    if (lastName && lastName.trim().length < 2) {
        errors.push("Last name must be at least 2 characters long");
    }

    if (errors.length > 0) {
        return handleError(res, "Validation failed", 400, errors);
    }

    // Trim whitespace for provided fields
    if (firstName) req.body.firstName = firstName.trim();
    if (lastName) req.body.lastName = lastName.trim();
    if (email) req.body.email = email.trim().toLowerCase();
    // if (phone) req.body.phone = phone.trim();

    next();
};

// Validate change password input
const validateChangePassword = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const errors = [];

    if (!currentPassword) errors.push("Current password is required");
    if (!newPassword) errors.push("New password is required");

    if (newPassword && newPassword.length < 6) {
        errors.push("New password must be at least 6 characters long");
    }

    if (currentPassword === newPassword) {
        errors.push("New password must be different from current password");
    }

    if (errors.length > 0) {
        return handleError(res, "Validation failed", 400, errors);
    }

    next();
};

// Validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return handleError(res, "ID parameter is required", 400);
    }

    // Basic ObjectId validation (24 characters, hexadecimal)
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return handleError(res, "Invalid ID format", 400);
    }

    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateUpdateProfile,
    validateChangePassword,
    validateObjectId
};