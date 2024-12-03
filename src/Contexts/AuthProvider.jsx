// import { AuthContext } from "./AuthContext";
// import { useNavigate } from "react-router-dom";
// import React, { useState, useEffect } from "react";
// import  axios  from 'axios';

// const LocalStorageKeys = {
//   AUTH_DATA: "authData",
// };

// export const AuthProvider = ({ children }) => {
//   const history = useNavigate();
//   const [authData, setAuthData] = useState(null);

//   const setUser = ({ user, token }) => {
//     const userData = { user, token };
//     localStorage.setItem(LocalStorageKeys.AUTH_DATA, JSON.stringify(Data));
//     setAuthData(userData);
//   };

//   const signOut = async () => {
//     try {
//       await axios.get("/logout", {
//         withCredentials: true, // Ensure cookies are included in the request
//       });
//     } catch (err) {
//       console.error("Logout failed:", err);
//     } finally {
//       localStorage.removeItem(LocalStorageKeys.AUTH_DATA);
//       setAuthData(null);
//       history("/");
//     }
//   };

//   // Load authData from local storage on initial render or whenever user refresh the page
//   useEffect(() => {
//     const storedAuthData = localStorage.getItem(LocalStorageKeys.AUTH_DATA);
//     if (storedAuthData) {
//       setAuthData(JSON.parse(storedAuthData));
//     }
//   }, []);

//   return (
//     <AuthContext.Provider value={{ authData, setUser, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import UseRefreshToken from "../hooks/UseRefreshToken";
import UseLogout from "./../hooks/UseLogout";

const LocalStorageKeys = {
  AUTH_DATA: "authData",
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const logout = UseLogout();
  const refresh = UseRefreshToken();
  // const [authData, setAuthData] = useState(() => {
  //   const storedData = localStorage.getItem(LocalStorageKeys.AUTH_DATA);
  //   return storedData ? { user: JSON.parse(storedData) } : null;
  // });
  const [authData, setAuthData] = useState(null);
  // Fetch and set the token if user exists but token is missing (e.g., on page refresh)
  useEffect(() => {
    const initializeAuth = async () => {
      if (authData?.user && !authData?.token) {
        const newToken = await refresh();
        setAuthData((prev) => ({ ...prev, token: newToken }));
      }
    };
    initializeAuth();
  }, [authData, refresh]);
 
  const setUser = ({ user, token }) => {
    localStorage.setItem(
      LocalStorageKeys.AUTH_DATA,
      JSON.stringify({ user, token })
    );
    setAuthData({ user, token });
  };

    // Load authData from local storage on initial render or whenever user refresh the page
  useEffect(() => {
    const storedAuthData = localStorage.getItem(LocalStorageKeys.AUTH_DATA);
    if (storedAuthData) {
      setAuthData(JSON.parse(storedAuthData));
    }
  }, []);

  const signOut = async () => {
    await logout();
    navigate("/");
    setAuthData(null);
    localStorage.removeItem(LocalStorageKeys.AUTH_DATA);
  };

  return (
    <AuthContext.Provider value={{ authData, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
