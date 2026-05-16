import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";

interface Props {
  allowedRoles: string[];
  redirectTo: string;
}

const ProtectedRoute = ({ allowedRoles, redirectTo }: Props) => {
  const auth = useAppSelector((state) => state.auth);

  if (!auth?.user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
