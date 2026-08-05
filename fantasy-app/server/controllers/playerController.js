const pool = require("../config/db");
const axios = require("axios");

//Method to display Player list from db
const getPlayers = async (req, res) => {
  const { search, position } = req.query;

  try {
    let query = 'SELECT * FROM players WHERE 1=1';
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND LOWER(name) LIKE LOWER($${values.length})`;
    }

    if (position) {
      values.push(position);
      query += ` AND position = $${values.length}`;
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getPlayerById = async (req, res) => {
  //Get player id from url
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM players WHERE id = $1", [
      id,
    ]);

    //Error catch for nonexistent player
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const createPlayer = async (req, res) => {
  const { id, name, position } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO players (id, name, position) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name 
       RETURNING *`,
      [id, name, position],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error saving player");
  }
};
let playerCache = { data: null, lastFetched: 0 };

const searchPlayers = async (req, res) => {
  const { position } = req.query;
  const CACHE_DURATION = 1000 * 60 * 60;

  try {
    if (
      !playerCache.data ||
      Date.now() - playerCache.lastFetched > CACHE_DURATION
    ) {
      console.log("Refreshing player cache from ESPN...");
      const teamIds = Array.from({ length: 30 }, (_, i) => i + 1);

      const responses = await Promise.all(
        teamIds.map((id) =>
          axios
            .get(
              `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${id}/roster`,
            )
            .catch((err) => {
              console.error(`Error fetching team ${id}:`, err.message);
              return { data: { athletes: [] } }; // Fallback for failed team requests
            }),
        ),
      );

      playerCache.data = responses.flatMap((r) => {
        // Defensive check: ESPN sometimes returns unexpected structures
        const athletes = r.data?.athletes || [];
        return athletes.flatMap((group) => group.items || []);
      });
      playerCache.lastFetched = Date.now();
    }

    const target = position ? position.toLowerCase().trim() : "";
    const filtered = playerCache.data.filter((player) => {
      const pPos = player.position?.displayName?.toLowerCase() || "";
      const pParent = player.position?.parent?.displayName?.toLowerCase() || "";

      if (target === "infielder") {
        const infieldList = [
          "first baseman",
          "second baseman",
          "third baseman",
          "shortstop",
          "infielder",
        ];
        return (
          (infieldList.includes(pPos) || infieldList.includes(pParent)) &&
          pPos !== "catcher"
        );
      }
      if (target === "hitter") {
        return pPos !== "pitcher";
      }

      return pPos === target || pParent === target;
    });

    res.json(filtered);
  } catch (err) {
    console.error("Critical Search Error:", err.stack); // Check your terminal for this!
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};

module.exports = { getPlayers, getPlayerById, createPlayer, searchPlayers };
