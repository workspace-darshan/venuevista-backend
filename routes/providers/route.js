const express = require("express");
const {
    registerProvider,
    loginProvider,
    getProviderProfile,
    updateProviderProfile,
    getAllProviders,
    getProviderById,
    updateProviderStatus,
    uploadDocuments,
    deleteProvider
} = require("./controller");
const { validateObjectId } = require("../../validations/users-validations");
const isAuth = require("../../middleware/isAuth");

const router = express.Router();

router.post("/register", registerProvider);
router.post("/login", loginProvider);
router.get("/",isAuth,getAllProviders);
router.get("/:id", validateObjectId, getProviderById);
router.get("/profile/me", isAuth,getProviderProfile);
router.put("/profile/update", updateProviderProfile);
router.post("/documents/upload", uploadDocuments);
router.delete("/profile/delete", deleteProvider);
router.put("/:id/status", validateObjectId, updateProviderStatus);

module.exports = router;