import { useAppSelector } from "../../hooks/reduxHooks";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const auth = useAppSelector((state) => state.auth);

  if (!auth || auth.user?.role != "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
