import API from './api';

export interface Player {
  id: number;
  name: string;
  position: string;
  team: string;
}

export const getPlayers = async (): Promise<Player[]> => {
  const response = await API.get('/players');
  return response.data;
};

export const getPlayerById = async (id: number) => {
  const response = await API.get(`/players/${id}`);
  return response.data;
};