import API from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LoginResponse {
  token: string;
}

export const login = async (
  identifier: string,
  password: string,
): Promise<string> => {
  const response = await API.post<LoginResponse>("/auth/login", {
    identifier,
    password,
  });

  const token = response.data.token;

  await AsyncStorage.setItem("token", token);

  return token;
};

export const register = async (
  username: string,
  email: string,
  password: string,
) => {
  const response = await API.post("/auth/register", {
    username,
    email,
    password,
  });

  return response.data;
};
