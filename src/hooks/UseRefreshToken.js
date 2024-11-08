import { AuthContext } from "../Contexts/AuthContext";
import { useContext } from "react";
import axios from "../api/axios";

const UseRefreshToken = () => {
  const authContext = useContext(AuthContext);

  const refresh = async () => {
    try {
      const response = await axios.get("/refresh", { withCredentials: true });
      const accessToken = response.data.accessToken;
      console.log(accessToken);
      authContext.setUser((prev) => ({
        ...prev,
        token: accessToken, // Store token in memory only
      }));

      return accessToken; // Provide token for immediate use
    } catch (error) {
      console.error("Token refresh failed:", error);
      // authContext.signOut(); // Optional: Sign out if token refresh fails
    }
  };

  return refresh;
};

export default UseRefreshToken;
