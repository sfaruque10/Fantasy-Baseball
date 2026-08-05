import API from './api';

interface User {
  id: number;
  username: string;
  email: string;
}

const getCurrentUser = async (): Promise<User> => {
  const response = await API.get('/auth/me');
  return response.data;
};

interface UserTeam {
  id: number;
  name: string;
  league_id: number;
  user_id?: number;
}

const getUserTeams = async (): Promise<UserTeam[]> => {
  const response = await API.get("/teams/my-teams");
  return response.data;
};

export { getCurrentUser, getUserTeams, User, UserTeam };