import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [impersonatedUser, setImpersonatedUser] = useState(null); // Stores the full user object

  return (
    <UserContext.Provider value={{ impersonatedUser, setImpersonatedUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};