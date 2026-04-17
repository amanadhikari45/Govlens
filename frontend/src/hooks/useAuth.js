import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gl_user');
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {
      localStorage.removeItem('gl_user');
    }
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE}/auth/login`,
        { username, password },
        { timeout: 15000 }
      );
      const userData = {
        username,
        role:         res.data.role,
        accessToken:  res.data.accessToken,
        refreshToken: res.data.refreshToken,
        expiresIn:    res.data.expiresIn,
      };
      setUser(userData);
      localStorage.setItem('gl_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      // FIX: operator-precedence bug in original — parentheses required
      let msg;
      if (!err.response) {
        msg = 'Cannot reach server. Make sure the backend is running on port 8080.';
      } else if (err.response.status === 401 || err.response.status === 403) {
        msg = 'Invalid username or password.';
      } else {
        msg = err.response?.data?.message || `Server error (${err.response.status}). Check backend logs.`;
      }
      setError(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('gl_user');
  }, []);

  return { user, login, logout, error, loading, isAuthenticated: !!user };
}
