const reviewSchema = new mongoose.Schema(
    {
        venueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Venue',
            required: true
        },

        // Customer Details (simplified)
        customerName: { type: String, required: true },
        customerPhone: { type: String, required: true },
        customerEmail: String,

        // Review Content
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String, maxlength: 500 },

        // Event Details
        eventType: { type: String, required: true },
        eventDate: Date,
        guestCount: Number,

        // Review Images
        images: [String],

        // Status
        isApproved: { type: Boolean, default: true }
    },
    { timestamps: true }
);