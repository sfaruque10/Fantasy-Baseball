import API from "./api";

export interface Team {
  id: number;
  name: string;
  username: string; // owner username
  user_id: number;
  total_season_points: number;
}

export const getTeamById = async (teamId: number): Promise<Team> => {
  const response = await API.get(`/teams/${teamId}`);
  return Array.isArray(response.data) ? response.data[0] : response.data;
};

// Get players on a team
export const getTeamPlayers = async (teamId: number) => {
  const response = await API.get(`/teams/${teamId}/players`);
  return response.data;
};

// Add player to team
export const addPlayerToTeam = async (
  teamId: number,
  player: any,
  leagueid: number,
  position: string,
) => {
  await API.post("/players", {
    id: player.id, // This matches your FK
    name: player.fullName,
    position: player?.position?.displayName || "N/A",
    // name: player.fullName,
    // position: player.position
  });
  const response = await API.post(`/teams/${teamId}/players`, {
    player_id: Number(player.id),
    slot: position,
    league_id: leagueid,
  });
  return response.data;
};

export const syncTeamPoints = async (teamId: number) => {
  const response = await API.post(`/teams/${teamId}/sync`);
  return response.data;
};

export interface TeamPlayer {
  id: number;
  player_id: number;
  name: string;
  position: string;
  team: string;
  slot: string;
  points: number; // Add this!
}

export const editPlayerSlot = async (
  teamId: number,
  playerId: number,
  newSlot: string,
) => {
  const response = await API.patch(`/teams/${teamId}/players`, {
    slot: newSlot,
  });

  return response.data;
};
