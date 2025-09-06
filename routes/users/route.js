const express = require("express");
const {
    registerUser,
    loginUser,
    getAllUsers,
    searchUsers,
    getCurrentUser,
    getUserById,
    updateProfile,
    changePassword,
    updateUser,
    deleteAccount,
    deleteUser,
} = require("./controller");
const { validateObjectId, validateUpdateProfile, validateChangePassword } = require("../../validations/users-validations");
const isAuth = require("../../middleware/isAuth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", isAuth, getAllUsers);
router.get("/search", searchUsers);
router.get("/profile", isAuth, getCurrentUser);
router.get("/:id", validateObjectId, isAuth, getUserById);
router.put("/profile", validateUpdateProfile, isAuth, updateProfile);
router.put("/change-password", validateChangePassword, changePassword);
router.put("/:id", validateObjectId, validateUpdateProfile, updateUser);
router.delete("/account", isAuth, deleteAccount);
router.delete("/:id", validateObjectId, deleteUser);

module.exports = router;