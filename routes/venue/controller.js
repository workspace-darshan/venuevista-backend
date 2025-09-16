const Venue = require("./model");
const Provider = require("../providers/model");
const { handleSuccess, handleError } = require("../../utils/common_utils");

// Create a new venue
const createVenue = async (req, res) => {
    try {
        console.log("🚀 ========>:")
        const providerId = req.provider.providerId;
        console.log("🚀 ~ createVenue ~ providerId:", providerId)

        // Check if provider exists and is approved
        const provider = await Provider.findById(providerId);
        if (!provider) {
            return handleError(res, "Provider not found", 404);
        }

        if (!provider.isApproved) {
            return handleError(res, "Provider must be approved to create venues", 403);
        }

        const venueData = {
            ...req.body,
            providerId
        };

        // If images are provided, ensure only one is set as primary
        if (venueData?.images && venueData?.images.length > 0) {
            const primaryCount = venueData.images.filter(img => img.isPrimary).length;
            if (primaryCount === 0) {
                venueData.images[0].isPrimary = true; // Set first image as primary if nonze specified
            }
        }

        const venue = new Venue(venueData);
        await venue.save();

        await venue.populate('providerId', 'businessName email phone');

        return handleSuccess(res, venue, "Venue created successfully", 201);

    } catch (error) {
        console.error("Create venue error:", error);
        return handleError(res, "Failed to create venue");
    }
};

// Get all venues with filters
const getAllVenues = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            city,
            state,
            minPrice,
            maxPrice,
            minCapacity,
            maxCapacity,
            facilities,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = { isActive: true };

        // Location filters
        if (city) filter['address.city'] = new RegExp(city, 'i');
        if (state) filter['address.state'] = new RegExp(state, 'i');

        // Price filters
        if (minPrice || maxPrice) {
            filter.basePrice = {};
            if (minPrice) filter.basePrice.$gte = Number(minPrice);
            if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
        }

        // Capacity filters
        if (minCapacity) filter['capacity.maxGuests'] = { $gte: Number(minCapacity) };
        if (maxCapacity) filter['capacity.minGuests'] = { $lte: Number(maxCapacity) };

        // Facilities filter
        if (facilities) {
            const facilityList = facilities.split(',');
            facilityList.forEach(facility => {
                if (facility.trim()) {
                    filter[`facilities.${facility.trim()}`] = true;
                }
            });
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (page - 1) * limit;

        const venues = await Venue.find(filter)
            .populate('providerId', 'businessName email phone address')
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit));

        const totalVenues = await Venue.countDocuments(filter);

        const responseData = {
            venues,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalVenues / limit),
                totalVenues,
                hasNext: page < Math.ceil(totalVenues / limit),
                hasPrev: page > 1
            }
        };
        return handleSuccess(res, responseData);

    } catch (error) {
        console.error("Get all venues error:", error);
        return handleError(res, "Failed to fetch venues");
    }
};

// Get venue by ID
const getVenueById = async (req, res) => {
    try {
        const { id } = req.params;

        const venue = await Venue.findById(id)
            .populate('providerId', 'businessName email phone address website');

        if (!venue) {
            return handleError(res, "Venue not found", 404);
        }

        return handleSuccess(res, venue);

    } catch (error) {
        console.error("Get venue by ID error:", error);
        return handleError(res, "Failed to fetch venue");
    }
};

// Get venues by provider (for provider dashboard)
const getMyVenues = async (req, res) => {
    try {
        const providerId = req.user.providerId;
        const { page = 1, limit = 10, status = 'all' } = req.query;

        const filter = { providerId };
        if (status !== 'all') {
            filter.isActive = status === 'active';
        }

        const skip = (page - 1) * limit;

        const venues = await Venue.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const totalVenues = await Venue.countDocuments(filter);

        const responseData = {
            venues,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalVenues / limit),
                totalVenues,
                hasNext: page < Math.ceil(totalVenues / limit),
                hasPrev: page > 1
            }
        };
        return handleSuccess(res, responseData);

    } catch (error) {
        console.error("Get my venues error:", error);
        return handleError(res, "Failed to fetch your venues");
    }
};

// Update venue
const updateVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const providerId = req.user.providerId;

        const venue = await Venue.findOne({ _id: id, providerId });

        if (!venue) {
            return handleError(res, "Venue not found or you don't have permission to update it", 404);
        }

        // Handle primary image logic if images are being updated
        if (req.body.images) {
            const primaryCount = req.body.images.filter(img => img.isPrimary).length;
            if (primaryCount === 0 && req.body.images.length > 0) {
                req.body.images[0].isPrimary = true;
            }
        }

        const updatedVenue = await Venue.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        ).populate('providerId', 'businessName email phone');

        return handleSuccess(res, updatedVenue, "Venue updated successfully");

    } catch (error) {
        console.error("Update venue error:", error);
        return handleError(res, error.message || "Failed to update venue");
    }
};

// Delete venue
const deleteVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const providerId = req.user.providerId;

        const venue = await Venue.findOne({ _id: id, providerId });

        if (!venue) {
            return handleError(res, "Venue not found or you don't have permission to delete it", 404);
        }

        await Venue.findByIdAndDelete(id);

        return handleSuccess(res, null, "Venue deleted successfully");

    } catch (error) {
        console.error("Delete venue error:", error);
        return handleError(res, "Failed to delete venue");
    }
};

// Toggle venue status (active/inactive)
const toggleVenueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const providerId = req.user.providerId;

        const venue = await Venue.findOne({ _id: id, providerId });

        if (!venue) {
            return handleError(res, "Venue not found or you don't have permission to update it", 404);
        }

        venue.isActive = !venue.isActive;
        await venue.save();

        return handleSuccess(res, venue, `Venue ${venue.isActive ? 'activated' : 'deactivated'} successfully`);

    } catch (error) {
        console.error("Toggle venue status error:", error);
        return handleError(res, "Failed to update venue status");
    }
};

// Upload venue images
const uploadVenueImages = async (req, res) => {
    try {
        const { id } = req.params;
        const providerId = req.user.providerId;
        const { images } = req.body; // Array of { url, caption, isPrimary }

        if (!images || !Array.isArray(images) || images.length === 0) {
            return handleError(res, "Images array is required", 400);
        }

        const venue = await Venue.findOne({ _id: id, providerId });

        if (!venue) {
            return handleError(res, "Venue not found or you don't have permission to update it", 404);
        }

        // If setting a new primary image, remove primary status from existing images
        const newPrimaryExists = images.some(img => img.isPrimary);
        if (newPrimaryExists) {
            venue.images.forEach(img => img.isPrimary = false);
        }

        // Add new images
        venue.images.push(...images);

        // If no primary image exists, set first image as primary
        if (!venue.images.some(img => img.isPrimary) && venue.images.length > 0) {
            venue.images[0].isPrimary = true;
        }

        await venue.save();

        return handleSuccess(res, venue, "Images uploaded successfully");

    } catch (error) {
        console.error("Upload venue images error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload images"
        });
    }
};

// Remove venue image
const removeVenueImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;
        const providerId = req.user.providerId;

        const venue = await Venue.findOne({ _id: id, providerId });

        if (!venue) {
            return handleError(res, "Venue not found or you don't have permission to update it", 404);
        }

        const imageIndex = venue.images.findIndex(img => img._id.toString() === imageId);

        if (imageIndex === -1) {
            return handleError(res, "Image not found", 404);
        }

        const removedImage = venue.images[imageIndex];
        venue.images.splice(imageIndex, 1);

        // If primary image was removed, set first remaining image as primary
        if (removedImage.isPrimary && venue.images.length > 0) {
            venue.images[0].isPrimary = true;
        }

        await venue.save();

        return handleSuccess(res, venue, "Image removed successfully");

    } catch (error) {
        console.error("Remove venue image error:", error);
        return handleError(res, "Failed to remove image");
    }
};

module.exports = {
    createVenue,
    getAllVenues,
    getVenueById,
    getMyVenues,
    updateVenue,
    deleteVenue,
    toggleVenueStatus,
    uploadVenueImages,
    removeVenueImage
};