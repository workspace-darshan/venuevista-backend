const { handleError, handleSuccess } = require("../../utils/common_utils");
const CategoryModel = require("./model");

// Create a new category
const createCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;

        // Check if category already exists
        const existingCategory = await CategoryModel.findOne({ name });
        if (existingCategory) {
            return handleError(res, "Category with this name already exists", 409);
        }

        const category = new CategoryModel({
            name,
            description,
            icon
        });

        const savedCategory = await category.save();
        return handleSuccess(res, savedCategory, "Category created successfully", 201);
    } catch (error) {
        if (error.code === 11000) {
            return handleError(res, "Category with this name already exists", 409);
        }
        return handleError(res, error.message, 500);
    }
};

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const { isActive } = req.query;
        const filter = {};

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const categories = await CategoryModel.find(filter).sort({ createdAt: -1 });
        return handleSuccess(res, categories, "Categories retrieved successfully");
    } catch (error) {
        return handleError(res, error.message, 500);
    }
};

// Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await CategoryModel.findById(id);

        if (!category) {
            return handleError(res, "Category not found", 404);
        }

        return handleSuccess(res, category, "Category retrieved successfully");
    } catch (error) {
        return handleError(res, error.message, 500);
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, isActive } = req.body;

        // Check if category exists
        const category = await CategoryModel.findById(id);
        if (!category) {
            return handleError(res, "Category not found", 404);
        }

        // Check if name is being updated and if it already exists
        if (name && name !== category.name) {
            const existingCategory = await CategoryModel.findOne({ name, _id: { $ne: id } });
            if (existingCategory) {
                return handleError(res, "Category with this name already exists", 409);
            }
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            id,
            { name, description, icon, isActive },
            { new: true, runValidators: true }
        );

        return handleSuccess(res, updatedCategory, "Category updated successfully");
    } catch (error) {
        if (error.code === 11000) {
            return handleError(res, "Category with this name already exists", 409);
        }
        return handleError(res, error.message, 500);
    }
};

// Update category status
const updateCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const category = await CategoryModel.findById(id);
        if (!category) {
            return handleError(res, "Category not found", 404);
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        return handleSuccess(res, updatedCategory, "Category status updated successfully");
    } catch (error) {
        return handleError(res, error.message, 500);
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await CategoryModel.findById(id);
        if (!category) {
            return handleError(res, "Category not found", 404);
        }

        await CategoryModel.findByIdAndDelete(id);
        return handleSuccess(res, null, "Category deleted successfully");
    } catch (error) {
        return handleError(res, error.message, 500);
    }
};

// Get categories by status
const getCategoriesByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const isActive = status === 'active';

        const categories = await CategoryModel.find({ isActive }).sort({ createdAt: -1 });
        return handleSuccess(res, categories, `${status} categories retrieved successfully`);
    } catch (error) {
        return handleError(res, error.message, 500);
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
    getCategoriesByStatus
};