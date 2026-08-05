const cron = require("node-cron");
const { syncAllLeagues } = require("../controllers/leagueController");

// Schedule to run every day at 3:00 AM
cron.schedule("0 3 * * *", async () => {
  console.log("--- Starting Daily Points Sync ---");
  try {
    await syncAllLeagues();
    console.log("--- Daily Sync Successful ---");
  } catch (error) {
    console.error("Daily Sync Failed:", error);
  }
});
