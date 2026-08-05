const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createTrade,
  getTradesForTeam,
  acceptTrade,
  rejectTrade,
} = require("../controllers/tradesController");

router.post("/", authMiddleware, createTrade);
router.get("/team/:teamId", authMiddleware, getTradesForTeam);
router.patch("/:id/accept", authMiddleware, acceptTrade);
router.patch("/:id/reject", authMiddleware, rejectTrade);

module.exports = router;
