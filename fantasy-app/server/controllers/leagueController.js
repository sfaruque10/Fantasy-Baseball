const pool = require("../config/db");

//Method to create league
const createLeague = async (req, res) => {
  //League Name from request
  const { name } = req.body;

  //Error if name is null (Remove later if error catch is made on front end)
  if (!name) {
    return res.status(400).json({ error: "League name is required" });
  }

  //Add league to database with owner id
  try {
    const result = await pool.query(
      "INSERT INTO leagues (name, owner_id, team_add, draft, draft_complete) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, req.user.id, true, false, false],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating league");
  }
};

//Method to join league
const joinLeague = async (req, res) => {
  //Get team name and league id from request
  const { name, league_name } = req.body;

  //Error catches if missing data (Remove later if error catch is added to front end)
  if (!name) {
    return res.status(400).json({ error: "Team name is required" });
  }
  if (!league_name) {
    return res.status(400).json({ error: "League Name is required" });
  }

  try {
    //Check if league trying to join exists
    const leagueCheck = await pool.query(
      "SELECT * FROM leagues WHERE LOWER(name) = LOWER($1)",
      [league_name],
    );

    if (leagueCheck.rows.length === 0) {
      return res.status(404).json({ error: "League not found" });
    }

    const league = leagueCheck.rows[0];

    if (league.team_add === false) {
      // check if team_add is false
      return res.status(403).json({
        error: "This league is currently locked and not accepting new teams.",
      });
    }

    //Check if user has already created a team in this league
    const existingTeam = await pool.query(
      "SELECT * FROM teams WHERE user_id = $1 AND league_id = $2",
      [req.user.id, league.id],
    );

    if (existingTeam.rows.length > 0) {
      return res.status(400).json({ error: "User already in this league" });
    }

    //Check if league is already at max team limit
    const teamCount = await pool.query(
      "SELECT COUNT(*) FROM teams WHERE league_id = $1",
      [league.id],
    );

    const count = parseInt(teamCount.rows[0].count);

    //Putting max as 16 for now, CHECK LATER IF MIND IS CHANGED
    if (count >= 16) {
      return res
        .status(400)
        .json({ error: "League is at maximum number of teams" });
    }

    //Add team to database with league id
    const result = await pool.query(
      "INSERT INTO teams (name, user_id, league_id, draft_order) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, req.user.id, league.id, count],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
};

//Method to display JSON league info per user
const getLeagues = async (req, res) => {
  try {
    //Gather League details from user id
    const result = await pool.query(
      `SELECT l.*, t.name AS team_name
        FROM leagues l
        JOIN teams t ON l.id = t.league_id
        WHERE t.user_id = $1`,
      [req.user.id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching leagues");
  }
};

//Method to get league by league id in request url
const getLeagueById = async (req, res) => {
  //Get league id from url
  const { id } = req.params;

  try {
    //Gather league details from league id
    const result = await pool.query(
      `SELECT l.id, l.name, l.owner_id, l.team_add, l.draft, l.draft_complete, u.username AS owner_name
        FROM leagues l
        JOIN users u ON l.owner_id = u.id
        WHERE l.id = $1`,
      [id],
    );

    //Error catch for nonexistent league
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "League not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching league");
  }
};
const getAvailableLeagues = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.id, l.name, u.username as owner_name,
       (SELECT COUNT(*) FROM teams WHERE league_id = l.id) as current_teams
       FROM leagues l
       JOIN users u ON l.owner_id = u.id
       WHERE l.team_add = true AND l.draft_complete = false`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leagues" });
  }
};
//Method to get teams in league by league id in request url
const getLeagueTeams = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        t.id, t.name, t.user_id, t.draft_order, u.username,
        COALESCE(
          (SELECT SUM(points) FROM daily_scores WHERE team_id = t.id AND slot NOT IN ('Bench', 'Any')), 
          0
        ) AS total_season_points
      FROM teams t 
      JOIN users u ON t.user_id = u.id 
      WHERE t.league_id = $1`,
      [id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error fetching teams");
  }
};

const getLeagueDraftedPlayers = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT player_id FROM team_players WHERE league_id = $1",
      [id],
    );

    const takenIds = result.rows.map((row) => Number(row.player_id));

    res.json(takenIds);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching drafted players");
  }
};

const lockLeaguePermanently = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE leagues 
       SET team_add = false 
       WHERE id = $1 AND owner_id = $2 
       RETURNING *`,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Unauthorized or League not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startDraft = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE leagues 
       SET draft = true 
       WHERE id = $1 AND owner_id = $2 AND team_add = false  AND draft = false
       RETURNING *`,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "League must be locked before starting the draft." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// backend leagueController.js
const checkDraftCompletion = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get the number of teams currently in the league
    const teamCountRes = await pool.query(
      "SELECT COUNT(*) FROM teams WHERE league_id = $1",
      [id],
    );
    const numTeams = parseInt(teamCountRes.rows[0].count);

    // 2. Set the total spots per team (Must match your front-end renderSlot count)
    const ROSTER_SIZE = 28;
    const totalRequiredPicks = numTeams * ROSTER_SIZE;

    // 3. Count how many players have been drafted across the ENTIRE league
    const draftedRes = await pool.query(
      "SELECT COUNT(*) FROM team_players WHERE league_id = $1",
      [id],
    );
    const actualPicks = parseInt(draftedRes.rows[0].count);

    // 4. If the draft is full, flip the draft bit to false
    if (actualPicks >= totalRequiredPicks) {
      await pool.query(
        "UPDATE leagues SET draft = false, draft_complete = true WHERE id = $1",
        [id],
      );
      return res.json({ finished: true });
    }

    res.json({ finished: false });
  } catch (err) {
    console.error("Completion check error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// const performInternalSync = async (teamId) => {
//   console.log(`Checking points for Team ID: ${teamId}`);

//   // 1. Reset today's points for this team
//   await pool.query("UPDATE team_players SET points = 0 WHERE team_id = $1", [
//     teamId,
//   ]);

//   const scoreboard = await axios.get(
//     "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
//   );
//   const eventIds = scoreboard.data.events.map((e) => e.id);

//   if (eventIds.length === 0) return;

//   for (const eventId of eventIds) {
//     const summary = await axios.get(
//       `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${eventId}`,
//     );
//     const teamsArray = summary.data.boxscore?.players;
//     if (!teamsArray) continue;

//     for (const teamData of teamsArray) {
//       for (const statSection of teamData.statistics) {
//         const rules =
//           statSection.type === "batting" ? BATTING_SCORING : PITCHING_SCORING;
//         const { keys, athletes } = statSection;

//         await Promise.all(
//           athletes.map(async (athleteData) => {
//             let totalPoints = 0;
//             const espnId = athleteData.athlete.id;

//             keys.forEach((key, index) => {
//               const val = athleteData.stats[index];
//               if (key === "fullInnings.partInnings") {
//                 const [inn, outs] = String(val).split(".").map(Number);
//                 totalPoints += inn * 3 + (outs || 0);
//               } else if (rules[key]) {
//                 totalPoints += (parseFloat(val) || 0) * rules[key];
//               }
//             });

//             if (totalPoints !== 0) {
//               const playerInfo = await pool.query(
//                 `SELECT p.id as internal_id, tp.slot
//                FROM players p
//                JOIN team_players tp ON p.id = tp.player_id
//                WHERE p.id = $1 AND tp.team_id = $2`,
//                 [espnId, teamId],
//               );

//               if (playerInfo.rows.length > 0) {
//                 const { internal_id, slot } = playerInfo.rows[0];
//                 await pool.query(
//                   "UPDATE team_players SET points = $1 WHERE team_id = $2 AND player_id = $3",
//                   [totalPoints, teamId, internal_id],
//                 );

//                 if (slot && slot !== "Bench") {
//                   await pool.query(
//                     "UPDATE teams SET total_season_points = total_season_points + $1 WHERE id = $2",
//                     [totalPoints, teamId],
//                   );
//                   await pool.query(
//                     `INSERT INTO daily_scores (team_id, player_id, points, slot)
//                    VALUES ($1, $2, $3, $4)
//                    ON CONFLICT (team_id, player_id, day)
//                    DO UPDATE SET points = EXCLUDED.points`,
//                     [teamId, internal_id, totalPoints, slot],
//                   );
//                 }
//               }
//             }
//           }),
//         );
//       }
//     }
//   }
// };
const performInternalSync = async (teamId) => {
  console.log(`\n--- Internal Sync for Team ID: ${teamId} ---`);

  try {
    // 1. Reset current game points for this team
    await pool.query("UPDATE team_players SET points = 0 WHERE team_id = $1", [
      teamId,
    ]);

    // 2. Fetch all games on the scoreboard
    const scoreboard = await axios.get(
      "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
    );
    const eventIds = scoreboard.data.events.map((e) => e.id);

    if (eventIds.length === 0) {
      console.log("No games found for today.");
      return;
    }

    // 3. Process every game found
    for (const eventId of eventIds) {
      const summary = await axios.get(
        `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${eventId}`,
      );

      const teamsArray = summary.data.boxscore?.players;
      if (!teamsArray) continue;

      for (const teamData of teamsArray) {
        // Use a map to sum stats if a player appears in multiple sections (Batting/Pitching)
        const athleteGamePoints = {};

        for (const statSection of teamData.statistics) {
          const rules =
            statSection.type === "batting" ? BATTING_SCORING : PITCHING_SCORING;
          const { keys, athletes } = statSection;

          athletes.forEach((athleteData) => {
            const espnId = athleteData.athlete.id;
            if (!athleteGamePoints[espnId]) athleteGamePoints[espnId] = 0;

            keys.forEach((key, index) => {
              const val = athleteData.stats[index];
              if (key === "fullInnings.partInnings") {
                const [inn, outs] = String(val).split(".").map(Number);
                athleteGamePoints[espnId] += (inn * 3 + (outs || 0)) * 1;
              } else if (rules[key]) {
                athleteGamePoints[espnId] +=
                  (parseFloat(val) || 0) * rules[key];
              }
            });
          });
        }

        // 4. Update the DB once per player for this game
        const athleteIds = Object.keys(athleteGamePoints);
        await Promise.all(
          athleteIds.map(async (espnId) => {
            const totalPoints = athleteGamePoints[espnId];
            if (totalPoints === 0) return;

            const playerInfo = await pool.query(
              `SELECT p.id as internal_id, tp.slot 
             FROM players p 
             JOIN team_players tp ON p.id = tp.player_id 
             WHERE p.id = $1 AND tp.team_id = $2`,
              [espnId, teamId],
            );

            if (playerInfo.rows.length > 0) {
              const { internal_id, slot } = playerInfo.rows[0];

              // Update current points for the active game
              await pool.query(
                "UPDATE team_players SET points = $1 WHERE team_id = $2 AND player_id = $3",
                [totalPoints, teamId, internal_id],
              );

              // Record history (Upsert based on team_id, player_id, and current day)
              await pool.query(
                `INSERT INTO daily_scores (team_id, player_id, points, slot, day)
               VALUES ($1, $2, $3, $4, CURRENT_DATE)
               ON CONFLICT (team_id, player_id, day) 
               DO UPDATE SET points = EXCLUDED.points, slot = EXCLUDED.slot`,
                [teamId, internal_id, totalPoints, slot],
              );
            }
          }),
        );
      }
    }

    // 5. CRITICAL FIX: Recalculate Season Total from the history table (Source of Truth)
    // This replaces the broken "total_season_points + $1" logic
    await pool.query(
      `UPDATE teams 
       SET total_season_points = (
         SELECT COALESCE(SUM(points), 0) 
         FROM daily_scores 
         WHERE team_id = $1 
         AND slot != 'Bench'
       )
       WHERE id = $1`,
      [teamId],
    );

    console.log(`--- Sync Finished for Team ${teamId} ---`);
  } catch (err) {
    console.error("Sync Error:", err.message);
  }
};
const syncAllLeagues = async () => {
  try {
    const teams = await pool.query("SELECT id FROM teams");
    for (const team of teams.rows) {
      await performInternalSync(team.id);
    }
    console.log("All leagues synced successfully.");
  } catch (err) {
    console.error("Global Sync Error:", err.message);
  }
};

const getLeagueStandings = async (req, res) => {
  const { id } = req.params; // league_id

  try {
    const result = await pool.query(
      `SELECT 
        t.id, 
        t.name, 
        u.username,
        -- Calculate the sum from history as the definitive score
        COALESCE(
          (SELECT SUM(points) FROM daily_scores WHERE team_id = t.id AND slot NOT IN ('Bench', 'Any')), 
          0
        ) AS total_points
      FROM teams t
      JOIN users u ON t.user_id = u.id
      WHERE t.league_id = $1
      ORDER BY total_points DESC`, // Highest points at the top
      [id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Standings error:", err.message);
    res.status(500).send("Error fetching standings");
  }
};

module.exports = {
  createLeague,
  joinLeague,
  getLeagues,
  getLeagueById,
  getLeagueTeams,
  getLeagueDraftedPlayers,
  lockLeaguePermanently,
  startDraft,
  checkDraftCompletion,
  performInternalSync,
  syncAllLeagues,
  getLeagueStandings,
  getAvailableLeagues,
};
