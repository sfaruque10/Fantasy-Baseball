const pool = require('../config/db');

const MAX_TEAM_SIZE = 28;

const createTrade = async (req, res) => {
  const {
    league_id,
    from_team_id,
    to_team_id,
    offered_players,
    requested_players
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Prevent self trade
    if (Number(from_team_id) === Number(to_team_id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Cannot trade with your own team'
      });
    }

    // Must include at least one side
    if (
      (!offered_players || offered_players.length === 0) &&
      (!requested_players || requested_players.length === 0)
    ) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Trade must include players'
      });
    }

    // Validate sending team exists + belongs to user
    const fromTeamRes = await client.query(
      'SELECT * FROM teams WHERE id = $1',
      [from_team_id]
    );

    if (fromTeamRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: 'Sending team not found'
      });
    }

    if (fromTeamRes.rows[0].user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        error: 'You do not control this team'
      });
    }

    // Validate receiving team exists
    const toTeamRes = await client.query(
      'SELECT * FROM teams WHERE id = $1',
      [to_team_id]
    );

    if (toTeamRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: 'Receiving team not found'
      });
    }

    // Create trade row
    const tradeResult = await client.query(
      `INSERT INTO trades
       (league_id, from_team_id, to_team_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [league_id, from_team_id, to_team_id]
    );

    const trade = tradeResult.rows[0];

    // Insert offered players
    for (const playerId of offered_players || []) {
      const ownRes = await client.query(
        `SELECT * FROM team_players
         WHERE team_id = $1 AND player_id = $2`,
        [from_team_id, playerId]
      );

      if (ownRes.rows.length === 0) {
        throw new Error(
          `Offered player ${playerId} is not on your team`
        );
      }

      await client.query(
        `INSERT INTO trade_players
         (trade_id, team_id, player_id)
         VALUES ($1, $2, $3)`,
        [trade.id, from_team_id, playerId]
      );
    }

    // Insert requested players
    for (const playerId of requested_players || []) {
      const ownRes = await client.query(
        `SELECT * FROM team_players
         WHERE team_id = $1 AND player_id = $2`,
        [to_team_id, playerId]
      );

      if (ownRes.rows.length === 0) {
        throw new Error(
          `Requested player ${playerId} is not on target team`
        );
      }

      await client.query(
        `INSERT INTO trade_players
         (trade_id, team_id, player_id)
         VALUES ($1, $2, $3)`,
        [trade.id, to_team_id, playerId]
      );
    }

    await client.query('COMMIT');

    res.json(trade);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);

    res.status(500).json({
      error: err.message
    });

  } finally {
    client.release();
  }
};

const getTradesForTeam = async (req, res) => {
  const { teamId } = req.params;

  try {
    const tradesResult = await pool.query(
      `
      SELECT
        t.*,

        ft.name AS from_team_name,
        tt.name AS to_team_name

      FROM trades t

      JOIN teams ft
        ON t.from_team_id = ft.id

      JOIN teams tt
        ON t.to_team_id = tt.id

      WHERE t.from_team_id = $1
         OR t.to_team_id = $1

      ORDER BY t.created_at DESC
      `,
      [teamId]
    );

    const trades = tradesResult.rows;

    for (const trade of trades) {
      const playersResult = await pool.query(
        `
        SELECT
          tp.team_id,
          p.id,
          p.name,
          p.position

        FROM trade_players tp

        JOIN players p
          ON tp.player_id = p.id

        WHERE tp.trade_id = $1
        `,
        [trade.id]
      );

      trade.offered_players =
        playersResult.rows.filter(
          (p) => p.team_id === trade.from_team_id
        );

      trade.requested_players =
        playersResult.rows.filter(
          (p) => p.team_id === trade.to_team_id
        );
    }

    res.json(trades);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

const rejectTrade = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const tradeRes = await client.query(
      'SELECT * FROM trades WHERE id = $1',
      [id]
    );

    if (tradeRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Trade not found' });
    }

    const trade = tradeRes.rows[0];

    if (trade.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Already processed' });
    }

    const teamRes = await client.query(
      'SELECT * FROM teams WHERE id = $1',
      [trade.to_team_id]
    );

    if (teamRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Team not found' });
    }

    if (teamRes.rows[0].user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await client.query(
      `UPDATE trades SET status='rejected' WHERE id=$1`,
      [id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Trade rejected' });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const acceptTrade = async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const tradeRes = await client.query(
    'SELECT * FROM trades WHERE id = $1',
    [id]
    );

    if (tradeRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Trade not found' });
    } 

    const trade = tradeRes.rows[0];

    if (trade.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Trade is not pending' });
    }

    const teamRes = await client.query(
    'SELECT * FROM teams WHERE id = $1',
    [trade.to_team_id]
    );

    if (teamRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Team not found' });
    }

    const receivingTeam = teamRes.rows[0];

    if (receivingTeam.user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        error: 'Only receiving team may accept trade'
      });
    }

    const playersRes = await client.query(
      'SELECT * FROM trade_players WHERE trade_id = $1',
      [id]
    );
    
    if (playersRes.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        error: 'Trade contains no players'
      });
    }

    const fromTeamRoster = await client.query(
      `SELECT COUNT(*) FROM team_players
      WHERE team_id = $1`,
      [trade.from_team_id]
    );

    const toTeamRoster = await client.query(
      `SELECT COUNT(*) FROM team_players
      WHERE team_id = $1`,
      [trade.to_team_id]
    );

    const offeredCount = playersRes.rows.filter(
      (p) => p.team_id === trade.from_team_id
    ).length;

    const requestedCount = playersRes.rows.filter(
      (p) => p.team_id === trade.to_team_id
    ).length;

    const fromTeamNewSize =
      Number(fromTeamRoster.rows[0].count)
      - offeredCount
      + requestedCount;

    const toTeamNewSize =
      Number(toTeamRoster.rows[0].count)
      - requestedCount
      + offeredCount;

    if (
      fromTeamNewSize > MAX_TEAM_SIZE ||
      toTeamNewSize > MAX_TEAM_SIZE
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error:
          "Trade exceeds maximum roster size",
      });
    }

    for (const row of playersRes.rows) {
      const ownershipCheck = await client.query(
        `
        SELECT tp.*
        FROM team_players tp
        JOIN teams t
          ON tp.team_id = t.id
        WHERE
          tp.team_id = $1
          AND tp.player_id = $2
          AND t.league_id = $3
        `,
        [row.team_id, row.player_id, trade.league_id]
      );

      if (ownershipCheck.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          error:
            "Trade invalid: a player is no longer on the expected team",
        });
      }
    }

    for (const row of playersRes.rows) {
      const newTeam =
        row.team_id === trade.from_team_id
          ? trade.to_team_id
          : trade.from_team_id;

      await client.query(
        `UPDATE team_players
        SET
          team_id = $1,
          slot = 'Bench'
        WHERE team_id = $2
          AND player_id = $3`,
        [newTeam, row.team_id, row.player_id]
      );
    }

    await client.query(
      `UPDATE trades
       SET status = 'accepted'
       WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Trade accepted' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });

  } finally {
    client.release();
  }
};

module.exports = { createTrade, getTradesForTeam, acceptTrade, rejectTrade };