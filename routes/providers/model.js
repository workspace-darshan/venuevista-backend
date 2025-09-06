const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const secretkey = require("../../config/constant").secretkey;

const providerSchema = new mongoose.Schema(
    {
        // Personal Details
        firstName: { type: String, required: true, trim: true },
        middleName: { type: String, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true
        },
        phone: {
            type: String,
            unique: true,
            required: true
        },
        password: { type: String, required: true, minlength: 6 },

        // Business Details
        businessName: { type: String, required: true, trim: true },
        businessType: {
            type: String,
            required: true,
            enum: ['party-plot', 'banquet-hall', 'farmhouse', 'resort', 'hotel', 'other']
        },
        description: { type: String, maxlength: 500 },
        website: { type: String },

        // Status
        isApproved: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },

        // Documents
        documents: [{
            type: {
                type: String,
                enum: ['license', 'identity', 'other']
            },
            url: String,
            isVerified: { type: Boolean, default: false }
        }],

        // Contact Info
        address: {
            street: String,
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true }
        },

        // Profile Images
        profileImage: String,
        coverImage: String
    },
    { timestamps: true }
);
// Hash password before saving
providerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

providerSchema.methods.generateToken = async function () {
    try {
        return jwt.sign(
            {
                userId: this._id.toString(),
                email: this.email,
            },
            secretkey,
            {
                expiresIn: "30d",
            }
        )
    } catch (error) {
        console.error("Token generation error:", error);
    }
}

// Compare password method
providerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Provider", providerSchema);
