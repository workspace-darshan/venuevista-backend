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
            minGuests: { type: Number, required: true },
            maxGuests: { type: Number, required: true }
        },

        // Location
        address: {
            street: { type: String, required: true },
            area: String,
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true }
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

        // Images
        images: [{
            url: { type: String, required: true },
            caption: String,
            isPrimary: { type: Boolean, default: false }
        }],

        // Base Venue Price (without add-ons)
        basePrice: { type: Number, required: true },

        // Status
        isActive: { type: Boolean, default: true },

        // Ratings Summary
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 }
    },
    { timestamps: true }
);
