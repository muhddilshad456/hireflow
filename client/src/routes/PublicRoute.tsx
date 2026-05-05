import { Navigate, Outlet, redirect } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";

interface ProtectedRouteProps {
  redirectTo: string;
}

const PublicRoute = ({ redirectTo }: ProtectedRouteProps) => {
  const token = useAppSelector((state) => state.auth.token);

  if (token) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
