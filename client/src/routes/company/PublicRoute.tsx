import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";

const PublicRoute = () => {
  const auth = useAppSelector((state) => state.auth);

  if (auth && auth.user?.role == "company_admin") {
    return <Navigate to="/company/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
