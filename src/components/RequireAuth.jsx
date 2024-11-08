import { useEffect } from "react";
import UseAuth from "../hooks/UseAuth";
import { useLocation, useNavigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const auth = UseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth) {
      // Redirect to login if not authenticated
      navigate("/", { state: { from: location }, replace: true });
    }
  }, [auth, navigate, location]);

  return auth ? children : null; // Render Outlet if authenticated
};

export default RequireAuth;
