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

        // Additional Details
        details: {
            // For food items
            menuItems: [String], // ["dal", "rice", "roti", "sabji"]
            servingStyle: { type: String, enum: ['buffet', 'served', 'both'] },

            // For music/DJ
            equipment: [String], // ["speakers", "microphone", "lights"]

            // For decorations
            decorationType: [String], // ["flowers", "balloons", "lights"]

            // General
            duration: String,
            teamSize: Number
        },

        // Status
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);
