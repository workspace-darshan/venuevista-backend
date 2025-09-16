const express = require("express");
const {
    createService,
    getAllServices,
    getServiceById,
    getServicesByVenue,
    getMyServices,
    updateService,
    deleteService,
    toggleServiceStatus
} = require("./controller");
const { validateObjectId } = require("../../validations/venue-validations");
const { serviceValidation, updateServiceValidation } = require("./validations");
const isAuth = require("../../middleware/isAuth");

const router = express.Router();

// Public routes
router.get("/", getAllServices); // Get all active services with filters
router.get("/:id", validateObjectId, getServiceById); // Get service by ID
router.get("/venue/:venueId", validateObjectId, getServicesByVenue); // Get services by venue ID

// Protected routes (authentication required)
router.post("/create", isAuth, serviceValidation, createService); // Create new service
router.get("/my/services", isAuth, getMyServices); // Get user's services
router.put("/:id/update", isAuth, validateObjectId, updateServiceValidation, updateService); // Update service
router.delete("/:id/delete", isAuth, validateObjectId, deleteService); // Delete service
router.patch("/:id/toggle-status", isAuth, validateObjectId, toggleServiceStatus); // Toggle active/inactive

module.exports = router;