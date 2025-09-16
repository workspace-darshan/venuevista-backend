const express = require("express");
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
    getCategoriesByStatus
} = require("./controller");
const { validateObjectId } = require("../../validations/users-validations");
const isAuth = require("../../middleware/isAuth");

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/status/:status", getCategoriesByStatus);
router.get("/:id", validateObjectId, getCategoryById);

// Protected routes (require authentication)
router.post("/", isAuth, createCategory);
router.put("/:id", isAuth, validateObjectId, updateCategory);
router.put("/:id/status", isAuth, validateObjectId, updateCategoryStatus);
router.delete("/:id", isAuth, validateObjectId, deleteCategory);

module.exports = router;