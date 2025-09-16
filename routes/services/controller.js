const ServiceModel = require('./model');
const VenueModel = require('../venue/model');

// Create a new service for a venue
const createService = async (req, res) => {
    try {
        const { venueId, name, description, price, duration, inclusions } = req.body;

        // Check if venue exists and belongs to the authenticated user
        const venue = await VenueModel.findById(venueId);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        // Check if user owns the venue (assuming venue has ownerId field)
        if (venue.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to add services to this venue'
            });
        }

        const service = new ServiceModel({
            venueId,
            name,
            description,
            price,
            duration,
            inclusions
        });

        await service.save();
        await service.populate('venueId', 'name location');

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });

    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all active services with filters
const getAllServices = async (req, res) => {
    try {
        const { venueId, name, minPrice, maxPrice, isActive = true } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = { isActive };

        if (venueId) filter.venueId = venueId;
        if (name) filter.name = name;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        const services = await ServiceModel.find(filter)
            .populate('venueId', 'name location images rating')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ServiceModel.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Services fetched successfully',
            data: services,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get service by ID
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await ServiceModel.findById(id)
            .populate('venueId', 'name location images rating description amenities');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service fetched successfully',
            data: service
        });

    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get services by venue ID
const getServicesByVenue = async (req, res) => {
    try {
        const { venueId } = req.params;
        const { isActive = true } = req.query;

        // Check if venue exists
        const venue = await VenueModel.findById(venueId);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        const services = await ServiceModel.find({ venueId, isActive })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Services fetched successfully',
            data: services
        });

    } catch (error) {
        console.error('Error fetching services by venue:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get services for authenticated user's venues
const getMyServices = async (req, res) => {
    try {
        const userId = req.user.id;
        const { isActive, name } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // First get all venues owned by the user
        const userVenues = await VenueModel.find({ ownerId: userId }).select('_id');
        const venueIds = userVenues.map(venue => venue._id);

        // Build filter object
        const filter = { venueId: { $in: venueIds } };
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (name) filter.name = name;

        const services = await ServiceModel.find(filter)
            .populate('venueId', 'name location')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ServiceModel.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Your services fetched successfully',
            data: services,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error('Error fetching user services:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update service
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration, inclusions } = req.body;

        const service = await ServiceModel.findById(id).populate('venueId', 'ownerId');
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check if user owns the venue
        if (service.venueId.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this service'
            });
        }

        const updatedService = await ServiceModel.findByIdAndUpdate(
            id,
            { name, description, price, duration, inclusions },
            { new: true, runValidators: true }
        ).populate('venueId', 'name location');

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: updatedService
        });

    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete service
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await ServiceModel.findById(id).populate('venueId', 'ownerId');
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check if user owns the venue
        if (service.venueId.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this service'
            });
        }

        await ServiceModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Toggle service status (active/inactive)
const toggleServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await ServiceModel.findById(id).populate('venueId', 'ownerId');
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check if user owns the venue
        if (service.venueId.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to modify this service'
            });
        }

        const updatedService = await ServiceModel.findByIdAndUpdate(
            id,
            { isActive: !service.isActive },
            { new: true }
        ).populate('venueId', 'name location');

        res.status(200).json({
            success: true,
            message: `Service ${updatedService.isActive ? 'activated' : 'deactivated'} successfully`,
            data: updatedService
        });

    } catch (error) {
        console.error('Error toggling service status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    getServicesByVenue,
    getMyServices,
    updateService,
    deleteService,
    toggleServiceStatus
};