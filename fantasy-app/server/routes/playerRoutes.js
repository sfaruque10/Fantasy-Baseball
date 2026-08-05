const express = require("express");
const router = express.Router();
const {
  getPlayers,
  getPlayerById,
  createPlayer,
  searchPlayers,
} = require("../controllers/playerController");
const authMiddleware = require('../middleware/authMiddleware');

//Path for Player table module call
router.get("/search", searchPlayers);
router.post("/", createPlayer);
router.get('/', authMiddleware, getPlayers);
router.get('/:id', authMiddleware, getPlayerById);

module.exports = router;
