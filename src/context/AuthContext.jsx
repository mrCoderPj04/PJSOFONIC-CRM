import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, removeAuthToken, getCurrentUserFromStorage } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getCurrentUserFromStorage());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    // Verify session on launch
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then(userData => setUser(userData))
        .catch(() => logout());
    }
  }, []);

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem('pjsofonic_user');
    setUser(null);
    setSelectedProjectId(null);
    setActiveTab('dashboard');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        activeTab,
        setActiveTab,
        selectedProjectId,
        setSelectedProjectId,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
