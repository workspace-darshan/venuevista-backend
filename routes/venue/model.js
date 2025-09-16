const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
    {
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Provider',
            required: true
        },

        // Basic Info
        name: { type: String, required: true },
        description: { type: String, required: true },

        // Capacity
        capacity: {
            minGuests: { type: Number, required: true, min: 1 },
            maxGuests: { type: Number, required: true, min: 1 }
        },

        // Location
        address: {
            street: { type: String, required: true, trim: true },
            area: { type: String, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            pincode: { type: String, required: true, trim: true }
        },

        // Basic Facilities
        facilities: {
            parking: { type: Boolean, default: false },
            airConditioning: { type: Boolean, default: false },
            powerBackup: { type: Boolean, default: false },
            restrooms: { type: Boolean, default: false },
            kitchen: { type: Boolean, default: false },
            stage: { type: Boolean, default: false }
        },

        images: [{
            url: { type: String, required: true },
            caption: { type: String, trim: true },
            isPrimary: { type: Boolean, default: false }
        }],

        // Base Venue Price (without add-ons)
        basePrice: { type: Number, required: true, min: 0 },

        // Status
        isActive: { type: Boolean, default: true },

        // Ratings Summary
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 }
    },
    { timestamps: true }
);

// Validation middleware
venueSchema.pre('save', function (next) {
    // Ensure maxGuests is greater than minGuests
    if (this.capacity.maxGuests <= this.capacity.minGuests) {
        return next(new Error('Maximum guests must be greater than minimum guests'));
    }

    // Ensure only one primary image
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
        return next(new Error('Only one image can be set as primary'));
    }

    next();
});

module.exports = mongoose.model("Venue", venueSchema);