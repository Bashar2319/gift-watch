import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on load and fetch profile
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('watch_token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch (error) {
          console.error('Session expired or invalid token', error.message);
          logout();
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('watch_token', data.token);
      // Fetch full profile info (with addresses)
      const profileRes = await api.get('/users/profile');
      setUser(profileRes.data);
      return profileRes.data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('watch_token', data.token);
      const profileRes = await api.get('/users/profile');
      setUser(profileRes.data);
      return profileRes.data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('watch_token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/users/profile', profileData);
      setUser((prev) => ({ ...prev, ...data }));
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setUser(data);
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Address operations
  const addAddress = async (addressData) => {
    try {
      const { data } = await api.post('/users/addresses', addressData);
      setUser((prev) => ({ ...prev, addresses: data }));
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      const { data } = await api.put(`/users/addresses/${addressId}`, addressData);
      setUser((prev) => ({ ...prev, addresses: data }));
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const { data } = await api.delete(`/users/addresses/${addressId}`);
      setUser((prev) => ({ ...prev, addresses: data }));
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        fetchProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
