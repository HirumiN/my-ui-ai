import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

export const UserContext = createContext(null);

export const UserProvider = ({ children, initialUser }) => {
  const [impersonatedUser, setImpersonatedUser] = useState(initialUser || null);

  useEffect(() => {
    setImpersonatedUser(initialUser);
  }, [initialUser]);

  const checkAuth = async () => {
    try {
      const user = await authService.checkAuth();
      setImpersonatedUser(user);
      return user;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <UserContext.Provider value={{ impersonatedUser, setImpersonatedUser, checkAuth }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};