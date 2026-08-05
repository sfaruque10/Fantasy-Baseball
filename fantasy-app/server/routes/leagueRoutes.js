const express = require("express");
const router = express.Router();
const {
  createLeague,
  joinLeague,
  getLeagues,
  getLeagueById,
  getLeagueTeams,
  getLeagueDraftedPlayers,
  lockLeaguePermanently,
  startDraft,
  checkDraftCompletion,
  getLeagueStandings,
  getAvailableLeagues,
} = require("../controllers/leagueController");
const authMiddleware = require("../middleware/authMiddleware");

//League method paths
router.post("/", authMiddleware, createLeague);
router.post("/join", authMiddleware, joinLeague);
router.get("/", authMiddleware, getLeagues);
router.get("/available", authMiddleware, getAvailableLeagues);
router.patch("/:id/toggle-lock", authMiddleware, lockLeaguePermanently);
router.patch("/:id/start-draft", authMiddleware, startDraft);
router.get("/:id/check-completion", authMiddleware, checkDraftCompletion);
router.get("/:id/standings", authMiddleware, getLeagueStandings);
//Keep /: at end of path
router.get("/:id", authMiddleware, getLeagueById);
router.get("/:id/teams", authMiddleware, getLeagueTeams);
router.get("/:id/drafted-players", authMiddleware, getLeagueDraftedPlayers);
module.exports = router;
