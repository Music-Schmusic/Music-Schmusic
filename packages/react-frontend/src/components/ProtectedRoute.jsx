import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ isLoggedIn, redirectTo }) => {
  return isLoggedIn ? <Outlet /> : <Navigate to={redirectTo} />;
};

export default ProtectedRoute;
