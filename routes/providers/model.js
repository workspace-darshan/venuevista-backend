const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const secretkey = require("../../config/constant").secretkey;

const providerSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        middleName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        phone: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        isApproved: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        venueName: { type: String },
        venueAddress: { type: String },
        city: { type: String },
        state: { type: String },
        pinCode: { type: String },
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

module.exports = mongoose.model("User", providerSchema);
