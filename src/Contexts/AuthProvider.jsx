import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import React, { useState,useEffect } from "react";

const LocalStorageKeys = {
  AUTH_DATA: "authData",
};

export const AuthProvider = ({ children }) => {
  const history = useNavigate();
  const [authData, setAuthData] = useState(null);

  const setUser = ({ user, token }) => {
    const userData = { user, token };
    localStorage.setItem(LocalStorageKeys.AUTH_DATA, JSON.stringify(userData));
    setAuthData(userData);
  };

  const signOut = () => {
    localStorage.removeItem(LocalStorageKeys.AUTH_DATA);
    setAuthData(null);
    history("/");
  };

  // Load authData from local storage on initial render or whenever user refresh the page 
  useEffect(() => {
    const storedAuthData = localStorage.getItem(LocalStorageKeys.AUTH_DATA);
    if (storedAuthData) {
      setAuthData(JSON.parse(storedAuthData));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authData, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
