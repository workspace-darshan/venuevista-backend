const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            enum: ['birthday', 'anniversary', 'engagement', 'wedding', 'corporate-party', 'family-function', 'festival', 'other']
        },
        description: String,
        icon: String,
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);