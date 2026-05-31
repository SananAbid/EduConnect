import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('educonnect_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async (tkn) => {
    if (!tkn) { setLoading(false); return; }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${tkn}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('educonnect_token');
        setToken(null);
      }
    } catch {
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser(token);
  }, [token, fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('educonnect_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, role) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Registration failed');
    localStorage.setItem('educonnect_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('educonnect_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  const authFetch = useCallback(async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });
    return res;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
