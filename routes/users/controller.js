const { handleError, handleSuccess } = require("../../utils/common_utils");
const UsersModel = require("./model");

const registerUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            isAdmin = false
        } = req.body;

        // Check required fields
        if (!firstName || !lastName || !email || !phone || !password) {
            return handleError(res, "All required fields must be filled", 400);
        }

        // Check if user already exists
        const userExists = await UsersModel.findOne({
            $or: [{ email }, { phone }]
        });

        if (userExists) {
            return handleError(res, "User already exists with this email or phone", 400);
        }

        // Create user data
        const userData = {
            firstName,
            lastName,
            email,
            phone,
            password,
            isAdmin
        };

        const user = await UsersModel.create(userData);
        const token = await user.generateToken();

        const responseData = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            token
        };

        return handleSuccess(res, responseData, "User registered successfully", 201);

    } catch (error) {
        console.error("Registration error:", error);
        return handleError(res, "Registration failed", 500, error.message);
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return handleError(res, "Email and password are required", 400);
        }

        const user = await UsersModel.findOne({ email });

        if (!user) {
            return handleError(res, "Invalid email or password", 401);
        }

        const isPasswordMatch = await user.matchPassword(password);

        if (!isPasswordMatch) {
            return handleError(res, "Invalid email or password", 401);
        }

        const token = await user.generateToken();

        const responseData = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            token
        };

        return handleSuccess(res, responseData, "Login successful");

    } catch (error) {
        console.error("Login error:", error);
        return handleError(res, "Login failed", 500, error.message);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await UsersModel.find({}, '-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalUsers = await UsersModel.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        const responseData = {
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };

        return handleSuccess(res, responseData, "Users retrieved successfully");

    } catch (error) {
        console.error("Get users error:", error);
        return handleError(res, "Failed to retrieve users", 500, error.message);
    }
};

// READ - Get User by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return handleError(res, "User ID is required", 400);
        }

        const user = await UsersModel.findById(id, '-password');

        if (!user) {
            return handleError(res, "User not found", 404);
        }

        return handleSuccess(res, user, "User retrieved successfully");

    } catch (error) {
        console.error("Get user error:", error);
        if (error.name === 'CastError') {
            return handleError(res, "Invalid user ID format", 400);
        }
        return handleError(res, "Failed to retrieve user", 500, error.message);
    }
};

// READ - Get Current User Profile
const getCurrentUser = async (req, res) => {
    try {
        console.log("🚀 ~ getCurrentUser ~ req.user:", req.user)
        const userId = req.user.userId; // Assuming middleware sets req.user

        const user = await UsersModel.findById(userId, '-password');

        if (!user) {
            return handleError(res, "User not found", 404);
        }

        return handleSuccess(res, user, "Profile retrieved successfully");

    } catch (error) {
        console.error("Get current user error:", error);
        return handleError(res, "Failed to retrieve profile", 500, error.message);
    }
};

// UPDATE - Update User
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (!id) {
            return handleError(res, "User ID is required", 400);
        }

        // Remove password from update data if present (use separate endpoint for password update)
        delete updateData.password;

        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Check if email or phone is being updated and already exists
        if (updateData.email || updateData.phone) {
            const existingUser = await UsersModel.findOne({
                $and: [
                    { _id: { $ne: id } },
                    {
                        $or: [
                            ...(updateData.email ? [{ email: updateData.email }] : []),
                            ...(updateData.phone ? [{ phone: updateData.phone }] : [])
                        ]
                    }
                ]
            });

            if (existingUser) {
                return handleError(res, "Email or phone already exists", 400);
            }
        }

        const user = await UsersModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return handleError(res, "User not found", 404);
        }

        return handleSuccess(res, user, "User updated successfully");

    } catch (error) {
        console.error("Update user error:", error);
        if (error.name === 'CastError') {
            return handleError(res, "Invalid user ID format", 400);
        }
        if (error.name === 'ValidationError') {
            return handleError(res, "Validation failed", 400, error.errors);
        }
        return handleError(res, "Failed to update user", 500, error.message);
    }
};

// UPDATE - Update Current User Profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming middleware sets req.user
        const updateData = { ...req.body };
        console.log("🚀 ~ updateProfile ~ updateData:", updateData)

        // Remove sensitive fields that shouldn't be updated via profile
        delete updateData.password;
        delete updateData.isAdmin;
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Check if email or phone is being updated and already exists
        if (updateData.email || updateData.phone) {
            const existingUser = await UsersModel.findOne({
                $and: [
                    { _id: { $ne: userId } },
                    {
                        $or: [
                            ...(updateData.email ? [{ email: updateData.email }] : []),
                            ...(updateData.phone ? [{ phone: updateData.phone }] : [])
                        ]
                    }
                ]
            });

            if (existingUser) {
                return handleError(res, "Email or phone already exists", 400);
            }
        }

        const user = await UsersModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return handleError(res, "User not found", 404);
        }

        return handleSuccess(res, user, "Profile updated successfully");

    } catch (error) {
        console.log("🚀 ~ updateProfile ~ error:", error)
        console.error("Update profile error:", error);
        if (error.name === 'ValidationError') {
            return handleError(res, "Validation failed", 400, error.errors);
        }
        return handleError(res, "Failed to update profile", 500, error.message);
    }
};

// UPDATE - Change Password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming middleware sets req.user
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return handleError(res, "Current password and new password are required", 400);
        }

        if (newPassword.length < 6) {
            return handleError(res, "New password must be at least 6 characters long", 400);
        }

        const user = await UsersModel.findById(userId);

        if (!user) {
            return handleError(res, "User not found", 404);
        }

        const isCurrentPasswordValid = await user.matchPassword(currentPassword);

        if (!isCurrentPasswordValid) {
            return handleError(res, "Current password is incorrect", 400);
        }

        user.password = newPassword;
        await user.save();

        return handleSuccess(res, null, "Password changed successfully");

    } catch (error) {
        console.error("Change password error:", error);
        return handleError(res, "Failed to change password", 500, error.message);
    }
};

// DELETE - Soft Delete User (you might want to add a deleted flag to schema)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return handleError(res, "User ID is required", 400);
        }

        const user = await UsersModel.findByIdAndDelete(id);

        if (!user) {
            return handleError(res, "User not found", 404);
        }

        return handleSuccess(res, null, "User deleted successfully");

    } catch (error) {
        console.error("Delete user error:", error);
        if (error.name === 'CastError') {
            return handleError(res, "Invalid user ID format", 400);
        }
        return handleError(res, "Failed to delete user", 500, error.message);
    }
};

// DELETE - Delete Current User Account
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming middleware sets req.user
        const { password } = req.body;

        if (!password) {
            return handleError(res, "Password confirmation is required", 400);
        }

        const user = await UsersModel.findById(userId);

        if (!user) {
            return handleError(res, "User not found", 404);
        }

        const isPasswordValid = await user.matchPassword(password);

        if (!isPasswordValid) {
            return handleError(res, "Password is incorrect", 400);
        }

        await UsersModel.findByIdAndDelete(userId);

        return handleSuccess(res, null, "Account deleted successfully");

    } catch (error) {
        console.error("Delete account error:", error);
        return handleError(res, "Failed to delete account", 500, error.message);
    }
};

// UTILITY - Search Users
const searchUsers = async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.query;

        if (!query) {
            return handleError(res, "Search query is required", 400);
        }

        const searchRegex = new RegExp(query, 'i');
        const skip = (page - 1) * limit;

        const users = await UsersModel.find({
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ]
        }, '-password')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const totalUsers = await UsersModel.countDocuments({
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ]
        });

        const responseData = {
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                hasNextPage: page < Math.ceil(totalUsers / limit),
                hasPrevPage: page > 1
            }
        };

        return handleSuccess(res, responseData, "Search completed successfully");

    } catch (error) {
        console.error("Search users error:", error);
        return handleError(res, "Search failed", 500, error.message);
    }
};

module.exports = {
    // Auth operations
    registerUser,
    loginUser,

    // CRUD operations
    getAllUsers,      // READ
    getUserById,      // READ
    getCurrentUser,   // READ
    updateUser,       // UPDATE
    updateProfile,    // UPDATE
    changePassword,   // UPDATE
    deleteUser,       // DELETE
    deleteAccount,    // DELETE

    // Utility
    searchUsers
}
