import { Routes, Route } from "react-router-dom";
import Login from "../../../features/user/auth/pages/Login";
import Signup from "../../../features/user/auth/pages/SignUp";
import EmailVerification from "../../../features/user/auth/pages/VerifyOtp";
import Home from "../../../features/user/home/pages/Home";
import ForgotPassword from "../../../features/user/auth/pages/ForgotPassword";
import ResetPassword from "../../../features/user/auth/pages/ResetPassword";
import { GoogleSuccess } from "../../../features/user/auth/pages/GoogleSuccess";
import ProtectedRoute from "../../../routes/ProtectedRoute";
import PublicRoute from "../../../routes/PublicRoute";
import { Jobs } from "../../../features/user/job/pages/Jobs";
import Job from "../../../features/user/job/pages/Job";
import { Profile } from "../../../features/user/profile/pages/Profile";
import { EmailVerificationPage } from "../../../features/shared/pages/VerifyEmail";
import { EmailVerificationResultPage } from "../../../features/shared/pages/VerifyResult";
import { AppliedJobs } from "../../../features/user/job/pages/AppliedJobs";
import { AppliedJobPage } from "../../../features/user/application/pages/ApplicationLayout";
import { StageRenderer } from "../../../features/user/application/components/StageRenderer";
import { ChatPage } from "../../../features/user/chat/pages/chat";

const UserRoutes = () => {
  return (
    <>
      <Routes>
        <Route
          element={
            <ProtectedRoute allowedRoles={["user"]} redirectTo="/login" />
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route
            path="/verify-email-change"
            element={<EmailVerificationResultPage />}
          />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/job" element={<Job />} />
          <Route path="/applied-jobs" element={<AppliedJobs />} />
          <Route
            path="/application/:applicationId"
            element={<AppliedJobPage />}
          >
            <Route path="stage/:stageId" element={<StageRenderer />} />
          </Route>
          <Route
            path="/application/:applicationId/chat"
            element={<ChatPage />}
          />
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
