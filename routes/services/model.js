const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
    {
        venueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Venue',
            required: true
        },

        // Service Details
        name: {
            type: String,
            required: true,
            enum: ['birthday', 'anniversary', 'engagement', 'wedding', 'corporate-party', 'family-function', 'other']
        },
        description: { type: String },

        // Pricing for this event type
        price: { type: Number, required: true },
        duration: { type: String, default: '4 hours' }, // "4 hours", "full day"

        // What's included in this service
        inclusions: [String], // ["venue", "basic decoration", "chairs"]

        // Status
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);