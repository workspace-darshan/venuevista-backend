const addonSchema = new mongoose.Schema(
    {
        venueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Venue',
            required: true
        },

        // Add-on Details
        name: {
            type: String,
            required: true,
            enum: ['music-dj', 'dinner', 'lunch', 'breakfast', 'decorations', 'lighting', 'photography', 'videography', 'mehendi', 'priest', 'security', 'other']
        },
        description: { type: String },

        // Pricing
        priceType: {
            type: String,
            enum: ['per-person', 'fixed', 'per-hour'],
            default: 'per-person'
        },
        price: { type: Number, required: true },

        // Status
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);
