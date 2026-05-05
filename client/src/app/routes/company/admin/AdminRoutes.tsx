import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../../../../features/company/admin/auth/pages/Login";
import SignUp from "../../../../features/company/admin/auth/pages/SignUp";
import VerifyOtp from "../../../../features/company/admin/auth/pages/VerifyOtp";
import HireFlow from "../../../../features/company/admin/dashboard/pages/Dashboard";
import ForgotPassword from "../../../../features/company/admin/auth/pages/ForgotPassword";
import ResetPassword from "../../../../features/company/admin/auth/pages/ResetPassword";
import PublicRoute from "../../../../routes/PublicRoute";
import ProtectedRoute from "../../../../routes/ProtectedRoute";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute redirectTo="/company/dashboard" />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route element={<ProtectedRoute redirectTo="/company/login" />}>
        <Route path="/dashboard" element={<HireFlow />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
