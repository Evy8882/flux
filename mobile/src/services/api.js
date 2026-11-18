import axios from "axios";
import { router } from "expo-router";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333/api",
  timeout: 10000,
});

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Interceptor para injetar o token nas requisições
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para capturar erros 401 (Sessão Expirada/Não Autorizado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpa o token da sessão
      setAuthToken(null);
      
      // Redireciona imediatamente para a tela de login
      router.replace("/Login");
    }
    return Promise.reject(error);
  }
);