import { useLocation, Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  const { state } = useLocation();

  // Check if user is logged in
  if (!state && !state.isAdmin) {
    return <Navigate to="/" />;
  }

  // User is authorized to access the requested page
  return <Outlet />;
};

export default PrivateRoutes;
