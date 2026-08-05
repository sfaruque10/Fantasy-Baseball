import API from "./api";

export interface TradePlayer {
  id: number;
  name: string;
  position: string;
}

export interface Trade {
  id: number;

  league_id: number;

  from_team_id: number;
  to_team_id: number;

  from_team_name: string;
  to_team_name: string;

  status: string;

  created_at: string;

  offered_players: TradePlayer[];

  requested_players: TradePlayer[];
}


export const getTradesForTeam = async (
  teamId: number
): Promise<Trade[]> => {
  const response = await API.get(`/trades/team/${teamId}`);
  return response.data;
};

export const createTrade = async (
  league_id: number,
  from_team_id: number,
  to_team_id: number,
  offered_players: number[],
  requested_players: number[]
) => {
  const response = await API.post("/trades", {
    league_id,
    from_team_id,
    to_team_id,
    offered_players,
    requested_players,
  });

  return response.data;
};

export const acceptTrade = async (tradeId: number) => {
  const response = await API.patch(`/trades/${tradeId}/accept`);
  return response.data;
};

export const rejectTrade = async (tradeId: number) => {
  const response = await API.patch(`/trades/${tradeId}/reject`);
  return response.data;
};