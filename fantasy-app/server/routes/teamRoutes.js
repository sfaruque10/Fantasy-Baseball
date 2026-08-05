const express = require("express");
const router = express.Router();
const {
  getTeamById,
  getUserTeams,
  getTeamPlayers,
  addPlayerToTeam,
  removePlayerFromTeam,
  updatePlayerSlot,
  syncTeamPoints,
} = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");

//Team method paths
router.get("/my-teams", authMiddleware, getUserTeams);
router.post("/:id/sync", authMiddleware, syncTeamPoints);
//Keep /: at end of path
router.get("/:id", authMiddleware, getTeamById);
router.get("/:id/players", authMiddleware, getTeamPlayers);
router.post("/:id/players", authMiddleware, addPlayerToTeam);
router.delete("/:id/players/:playerId", authMiddleware, removePlayerFromTeam);
router.patch("/:id/players", authMiddleware, updatePlayerSlot);

module.exports = router;
