import { Routes, Route } from "react-router-dom";
import Login from "../../../../features/company/admin/auth/pages/Login";
import SignUp from "../../../../features/company/admin/auth/pages/SignUp";
import VerifyOtp from "../../../../features/company/admin/auth/pages/VerifyOtp";
import { AdminLayout } from "./AdminLayout";
import ForgotPassword from "../../../../features/company/admin/auth/pages/ForgotPassword";
import ResetPassword from "../../../../features/company/admin/auth/pages/ResetPassword";
import PublicRoute from "../../../../routes/company/PublicRoute";
import ProtectedRoute from "../../../../routes/company/ProtectedRoute";
import { Dashboard } from "../../../../features/company/admin/dashboard/pages/Dashboard";
import { RecruiterInvitations } from "../../../../features/company/admin/dashboard/pages/RecruiterInvitations";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/recruiter-invitations"
            element={<RecruiterInvitations />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
