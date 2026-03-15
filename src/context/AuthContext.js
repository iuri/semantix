import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

const TOKEN_KEY = 'auth_token';
const AuthContext = createContext();

const api = axios.create({
  baseURL: API_BASE_URL,
});

const extractToken = (data) =>
  data?.token || data?.access_token || data?.data?.token || data?.data?.access_token || null;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          setToken(stored);
          api.defaults.headers.common.Authorization = `Bearer ${stored}`;
        }
      } catch (err) {
        console.warn('Failed to load token', err);
      } finally {
        setIsBootstrapping(false);
      }
    };
    loadToken();
  }, []);

  const login = async ({ email, password }) => {
    const response = await api.post('http://localhost:8000/api/login', { email, password });
    const receivedToken = extractToken(response?.data);

    if (!receivedToken) {
      const backendMessage = response?.data?.message || 'Missing token in response';
      throw new Error(backendMessage);
    }

    setToken(receivedToken);
    api.defaults.headers.common.Authorization = `Bearer ${receivedToken}`;
    await SecureStore.setItemAsync(TOKEN_KEY, receivedToken);
    return receivedToken;
  };

  const register = async ({ first_name, last_name, email, phone, cpf, location, password }) => {
    const response = await api.post('http://localhost:8000/api/register', {
      first_name,
      last_name,
      email,
      phone,
      cpf,
      location,
      password,
    });
    return response.data;
  };

  const logout = async () => {
    setToken(null);
    delete api.defaults.headers.common.Authorization;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  const value = useMemo(
    () => ({ token, isAuthenticated, isBootstrapping, login, logout, register, api }),
    [token, isAuthenticated, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
