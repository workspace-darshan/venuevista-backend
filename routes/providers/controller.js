const ProviderModel = require("./model"); // Adjust path as needed
const { handleSuccess, handleError } = require("../../utils/common_utils");

// Register Provider
const registerProvider = async (req, res) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            email,
            phone,
            password,
            businessName,
            businessType,
            description,
            website,
            address,
            profileImage,
            coverImage
        } = req.body;

        // Check if provider already exists
        const existingProvider = await ProviderModel.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingProvider) {
            return handleError(res, "Provider already exists with this email or phone", 400);
        }

        // Create new provider
        const provider = new ProviderModel({
            firstName,
            middleName,
            lastName,
            email,
            phone,
            password,
            businessName,
            businessType,
            description,
            website,
            address,
            profileImage,
            coverImage
        });

        await provider.save();
        const token = await provider.generateToken();

        return handleSuccess(res, {
            provider: {
                id: provider._id,
                firstName: provider.firstName,
                lastName: provider.lastName,
                email: provider.email,
                businessName: provider.businessName,
                isApproved: provider.isApproved
            },
            token
        }, "Provider registered successfully. Account pending approval.", 201);

    } catch (error) {
        console.error("Registration error:", error);
        return handleError(res, "Server error during registration", 500);
    }
};

// Login Provider
const loginProvider = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find provider
        const provider = await ProviderModel.findOne({ email });
        if (!provider) {
            return handleError(res, "Invalid credentials", 401);
        }

        // Check password
        const isMatch = await provider.matchPassword(password);
        if (!isMatch) {
            return handleError(res, "Invalid credentials", 401);
        }

        // Check if provider is active
        if (!provider.isActive) {
            return handleError(res, "Account is deactivated", 403);
        }

        const token = await provider.generateToken();
console.log("token",token)
        return handleSuccess(res, {
            provider: {
                id: provider._id,
                firstName: provider.firstName,
                lastName: provider.lastName,
                email: provider.email,
                businessName: provider.businessName,
                isApproved: provider.isApproved,
                isActive: provider.isActive
            },
            token
        }, "Login successful");

    } catch (error) {
        console.error("Login error:", error);
        return handleError(res, "Server error during login", 500);
    }
};

// Get Provider Profile
const getProviderProfile = async (req, res) => {
    try {
        const provider = await ProviderModel.findById(req.provider.providerId).select('-password');
        
        if (!provider) {
            return handleError(res, "Provider not found", 404);
        }

        return handleSuccess(res, { provider });

    } catch (error) {
        console.error("Get profile error:", error);
        return handleError(res, "Server error", 500);
    }
};

// Update Provider Profile
const updateProviderProfile = async (req, res) => {
    try {
        const updates = req.body;
        
        // Remove sensitive fields that shouldn't be updated directly
        delete updates.password;
        delete updates.email;
        delete updates.isApproved;
        delete updates.isActive;

        const provider = await ProviderModel.findByIdAndUpdate(
            req.provider.providerId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!provider) {
            return handleError(res, "Provider not found", 404);
        }

        return handleSuccess(res, { provider }, "Profile updated successfully");

    } catch (error) {
        console.error("Update profile error:", error);
        return handleError(res, "Server error during update", 500);
    }
};

// Get All Providers (for users to browse)
const getAllProviders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            businessType,
            city,
            state,
            search
        } = req.query;

        // Build filter query
        let filter = { isApproved: true, isActive: true };

        if (businessType) {
            filter.businessType = businessType;
        }

        if (city) {
            filter['address.city'] = new RegExp(city, 'i');
        }

        if (state) {
            filter['address.state'] = new RegExp(state, 'i');
        }

        if (search) {
            filter.$or = [
                { businessName: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') }
            ];
        }

        const skip = (page - 1) * limit;

        const providers = await ProviderModel.find(filter)
            .select('-password -documents')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ProviderModel.countDocuments(filter);

        return handleSuccess(res, {
            providers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalProviders: total,
                hasMore: skip + providers.length < total
            }
        });

    } catch (error) {
        console.error("Get providers error:", error);
        return handleError(res, "Server error", 500);
    }
};

// Get Provider by ID
const getProviderById = async (req, res) => {
    try {
        const { id } = req.params;

        const provider = await ProviderModel.findOne({
            _id: id,
            isApproved: true,
            isActive: true
        }).select('-password -documents');

        if (!provider) {
            return handleError(res, "Provider not found", 404);
        }

        return handleSuccess(res, { provider });

    } catch (error) {
        console.error("Get provider by ID error:", error);
        return handleError(res, "Server error", 500);
    }
};

// Update Provider Status (Admin function)
const updateProviderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved, isActive } = req.body;

        const provider = await ProviderModel.findByIdAndUpdate(
            id,
            { isApproved, isActive },
            { new: true }
        ).select('-password');

        if (!provider) {
            return handleError(res, "Provider not found", 404);
        }

        return handleSuccess(res, { provider }, "Provider status updated successfully");

    } catch (error) {
        console.error("Update status error:", error);
        return handleError(res, "Server error during status update", 500);
    }
};

// Upload Documents
const uploadDocuments = async (req, res) => {
    try {
        const { documents } = req.body; // Array of document objects

        const provider = await ProviderModel.findById(req.provider.providerId);
        if (!provider) {
            return handleError(res, "Provider not found", 404);
        }

        // Add new documents
        provider.documents.push(...documents);
        await provider.save();

        return handleSuccess(res, { documents: provider.documents }, "Documents uploaded successfully");

    } catch (error) {
        console.error("Upload documents error:", error);
        return handleError(res, "Server error during document upload", 500);
    }
};

// Delete Provider
const deleteProvider = async (req, res) => {
    try {
        const provider = await ProviderModel.findByIdAndDelete(req.provider.providerId);
        
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found"
            });
        }

        res.json({
            success: true,
            message: "Provider account deleted successfully"
        });

    } catch (error) {
        console.error("Delete provider error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during deletion"
        });
    }
};

module.exports = {
    registerProvider,
    loginProvider,
    getProviderProfile,
    updateProviderProfile,
    getAllProviders,
    getProviderById,
    updateProviderStatus,
    uploadDocuments,
    deleteProvider
};