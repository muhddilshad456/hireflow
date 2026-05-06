import { Routes, Route } from "react-router-dom";
import Login from "../../../features/user/auth/pages/Login";
import Signup from "../../../features/user/auth/pages/SignUp";
import EmailVerification from "../../../features/user/auth/pages/VerifyOtp";
import Home from "../../../features/user/home/pages/Home";
import ForgotPassword from "../../../features/user/auth/pages/ForgotPassword";
import ResetPassword from "../../../features/user/auth/pages/ResetPassword";
import { GoogleSuccess } from "../../../features/user/auth/pages/GoogleSuccess";
import ProtectedRoute from "../../../routes/user/ProtectedRoute";
import PublicRoute from "../../../routes/user/PublicRoute";

const UserRoutes = () => {
  return (
    <>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route element={<PublicRoute />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/google-success" element={<GoogleSuccess />} />
        </Route>
      </Routes>
    </>
  );
};

export default UserRoutes;
