import { Navigate } from "react-router-dom";

const PrivateRoutes = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("authData"));

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  // User is authorized to access the requested page
  return children;
};

export default PrivateRoutes;
