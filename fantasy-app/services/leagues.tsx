import API from "./api";

export interface League {
  id: number;
  name: string;
  owner_name: string;
  owner_id: number;
  team_add: boolean;
  draft: boolean;
  draft_complete: boolean;
}

export interface StandingTeam {
  id: number;
  name: string;
  username: string;
  total_points: number;
}

export const getLeagues = async (): Promise<League[]> => {
  const response = await API.get("/leagues");
  return response.data;
};

export const createLeague = async (name: string) => {
  const response = await API.post("/leagues", { name });
  return response.data;
};

export const joinLeague = async (name: string, league_name: string) => {
  const response = await API.post("/leagues/join", {
    name,
    league_name,
  });
  return response.data;
};

export const getLeagueDetails = async (id: number) => {
  const response = await API.get(`/leagues/${id}`);
  return response.data;
};

export interface Team {
  id: number;
  name: string;
  username: string;
  user_id: number;
  draft_order: number;
  total_season_points: number;
}

export const getLeagueTeams = async (leagueId: number): Promise<Team[]> => {
  const response = await API.get(`/leagues/${leagueId}/teams`);
  return response.data;
};
export const getAvailableLeagues = async () => {
  const response = await API.get("/leagues/available");
  return response.data;
};

export const lockLeaguePermanently = async (id: number) => {
  const response = await API.patch(`/leagues/${id}/toggle-lock`);
  return response.data;
};

export const startLeagueDraft = async (id: number) => {
  const response = await API.patch(`/leagues/${id}/start-draft`);
  return response.data;
};

export const checkDraftCompletion = async (leagueId: number) => {
  const response = await API.get(`/leagues/${leagueId}/check-completion`);
  return response.data; // Should return { finished: boolean }
};

export const getLeagueStandings = async (
  leagueId: number,
): Promise<StandingTeam[]> => {
  const response = await API.get(`/leagues/${leagueId}/standings`);
  return response.data;
};
