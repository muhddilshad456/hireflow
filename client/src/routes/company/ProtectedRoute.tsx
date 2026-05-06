import { useAppSelector } from "../../hooks/reduxHooks";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const auth = useAppSelector((state) => state.auth);

  if (!auth || auth.user?.role != "company_admin") {
    return <Navigate to="/company/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
