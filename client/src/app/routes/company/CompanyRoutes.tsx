import { Route, Routes } from "react-router-dom";
import AdminRoutes from "./admin/AdminRoutes";
import PublicRoute from "../../../routes/PublicRoute";
import Login from "../../../features/company/shared/auth/pages/Login";
import SignUp from "../../../features/company/shared/auth/pages/SignUp";
import VerifyOtp from "../../../features/company/shared/auth/pages/VerifyOtp";
import ForgotPassword from "../../../features/company/shared/auth/pages/ForgotPassword";
import ResetPassword from "../../../features/company/shared/auth/pages/ResetPassword";
import AcceptInvite from "../../../features/company/shared/auth/pages/AcceptInvite";

const CompanyRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="verify-otp" element={<VerifyOtp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="accept-invite" element={<AcceptInvite />} />
      </Route>

      {/* ✅ Role-based route splitting */}
      <Route path="admin/*" element={<AdminRoutes />} />
    </Routes>
  );
};

export default CompanyRoutes;
