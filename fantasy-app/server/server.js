require("dotenv").config();
const express = require("express");
const pool = require("./config/db");
const playerRoutes = require("./routes/playerRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const leagueRoutes = require("./routes/leagueRoutes");
const teamRoutes = require("./routes/teamRoutes");
const cors = require("cors");
const tradeRoutes = require("./routes/tradeRoutes");
const cron = require("node-cron");
const { syncAllLeagues } = require("./controllers/leagueController");
const app = express();
const axios = require("axios");
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

//Test call to display from a test-db
app.get("/test-db", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows);
});

//Route to check players
app.use("/players", playerRoutes);

//Route for authentication pages
app.use("/auth", authRoutes);

//Route for league methods and pages
app.use("/leagues", leagueRoutes);

//Route for team methods and pages
app.use("/teams", teamRoutes);

//Route for trade methods and pages
app.use("/trades", tradeRoutes);
app.get("/api/mlb/teams", async (req, res) => {
  try {
    const response = await axios.get(
      "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams",
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});
app.get("/api/mlb/scoreboard", async (req, res) => {
  try {
    const response = await axios.get(
      "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scoreboard" });
  }
});
//Test call for middleware functionality
app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

cron.schedule("0 3 * * *", async () => {
  console.log("--- CRON: Starting Daily Points Sync ---");
  try {
    await syncAllLeagues();
    console.log("--- CRON: Daily Sync Completed Successfully ---");
  } catch (err) {
    console.error("--- CRON: Daily Sync Failed ---", err.message);
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running on port ${PORT}`,
  );
});