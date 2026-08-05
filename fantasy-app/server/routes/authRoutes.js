const express = require("express");
const router = express.Router();
const { register, login, getCurrentUser } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

//Authentication method paths
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;
