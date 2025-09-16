const express = require("express");
const {
    createVenue,
    getAllVenues,
    getVenueById,
    getMyVenues,
    updateVenue,
    deleteVenue,
    toggleVenueStatus,
    uploadVenueImages,
    removeVenueImage
} = require("./controller");
const { validateObjectId } = require("../../validations/users-validations");
const isAuth = require("../../middleware/isAuth");

const router = express.Router();

router.get("/", getAllVenues); // Get all active venues with filters
router.get("/:id", validateObjectId, getVenueById); // Get venue by ID

// Protected routes (authentication required)
router.post("/create", isAuth, createVenue); // Create new venue
router.get("/my/venues", isAuth, getMyVenues); // Get provider's venues
router.put("/:id/update", isAuth, validateObjectId, updateVenue); // Update venue
router.delete("/:id/delete", isAuth, validateObjectId, deleteVenue); // Delete venue
router.patch("/:id/toggle-status", isAuth, validateObjectId, toggleVenueStatus); // Toggle active/inactive

// Image management routes

router.post("/:id/images/upload", isAuth, validateObjectId, uploadVenueImages); // Upload images
router.delete("/:id/images/:imageId", isAuth, validateObjectId, removeVenueImage); // Remove specific image

module.exports = router;