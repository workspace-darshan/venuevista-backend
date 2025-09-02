const express = require("express");
const { registerUser, loginUser } = require("./controller");
const { approveProvider } = require("../notifications/controller");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/approve-provider", approveProvider);

module.exports = router;