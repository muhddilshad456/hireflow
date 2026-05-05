import { useAppSelector } from "../hooks/reduxHooks";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  redirectTo: string;
}

const ProtectedRoute = ({ redirectTo }: ProtectedRouteProps) => {
  const token = useAppSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
