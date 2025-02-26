import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = ({ isLoggedIn, redirectTo }) => {
  return !isLoggedIn ? <Outlet /> : <Navigate to={redirectTo} />;
};

export default PublicRoute;
