import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";

const PublicRoute = () => {
  const auth = useAppSelector((state) => state.auth);

  if (auth && auth.user?.role == "user") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
