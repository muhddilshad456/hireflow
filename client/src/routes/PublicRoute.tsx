import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";

const PublicRoute = () => {
  const auth = useAppSelector((state) => state.auth);

  if (auth?.user) {
    switch (auth.user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "company_admin":
        return <Navigate to="/company/admin/dashboard" replace />;
      case "company_recruiter":
        return <Navigate to="/company/recruiter/dashboard" replace />;
      case "company_interviewer":
        return <Navigate to="/company/interviewer/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;
