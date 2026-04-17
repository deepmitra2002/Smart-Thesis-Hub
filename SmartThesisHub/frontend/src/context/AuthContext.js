import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [socket, setSocket]       = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Restore session on app load
  useEffect(() => {
    const token = localStorage.getItem('sth_token');
    const savedUser = localStorage.getItem('sth_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        authAPI.getMe()
          .then(({ data }) => { setUser(data.user); setProfile(data.profile); })
          .catch(() => { localStorage.clear(); setUser(null); })
          .finally(() => setLoading(false));
      } catch { setLoading(false); }
    } else {
      setLoading(false);
    }
  }, []);

  // Setup Socket.io when user logs in
  useEffect(() => {
    if (user) {
      const s = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
      s.on('connect', () => {
        s.emit('join', user._id);
        console.log('Socket connected');
      });
      s.on('new_notification', (notif) => {
        setNotifications(prev => [{ ...notif, isRead: false, createdAt: new Date() }, ...prev]);
      });
      s.on('request_updated', () => { /* trigger refresh */ });
      setSocket(s);
      return () => s.disconnect();
    }
  }, [user?._id]);

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('sth_token', data.token);
    localStorage.setItem('sth_refresh_token', data.refreshToken);
    localStorage.setItem('sth_user', JSON.stringify(data.user));
    setUser(data.user);
    setProfile(data.profile);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData);
    localStorage.setItem('sth_token', data.token);
    localStorage.setItem('sth_refresh_token', data.refreshToken);
    localStorage.setItem('sth_user', JSON.stringify(data.user));
    setUser(data.user);
    setProfile(data.profile);
    return data;
  }, []);

  const logout = useCallback(() => {
    authAPI.logout().catch(() => {});
    localStorage.removeItem('sth_token');
    localStorage.removeItem('sth_refresh_token');
    localStorage.removeItem('sth_user');
    setUser(null);
    setProfile(null);
    setNotifications([]);
    if (socket) socket.disconnect();
  }, [socket]);

  const updateProfile = useCallback((newProfile) => setProfile(newProfile), []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthContext.Provider value={{
      user, profile, loading, socket, notifications, unreadCount,
      login, register, logout, updateProfile, setNotifications,
      isStudent:    user?.role === 'student',
      isSupervisor: user?.role === 'supervisor',
      isAdmin:      user?.role === 'admin',
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
