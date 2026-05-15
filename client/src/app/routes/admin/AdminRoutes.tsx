import { Routes, Route } from "react-router-dom";
import Login from "../../../features/admin/auth/pages/Login";
import { AdminLayout } from "./AdminLayout";
import { Dashboard } from "../../../features/admin/dashboard/pages/DashBoard";
import { CompanyManagement } from "../../../features/admin/dashboard/pages/CompanyMangement";
import { UserManagement } from "../../../features/admin/dashboard/pages/UserManagement";
import { AuditReports } from "../../../features/admin/dashboard/pages/AuditReport";
import { JobManagement } from "../../../features/admin/dashboard/pages/JobManagement";
import { NotFound } from "../../../features/shared/pages/NotFound";
import ForgotPassword from "../../../features/admin/auth/pages/ForgotPassword";
import ResetPassword from "../../../features/admin/auth/pages/ResetPassword";
import ProtectedRoute from "../../../routes/admin/ProtectedRoute";
import PublicRoute from "../../../routes/admin/PublicRoute";
import { CompanyApprovalManagement } from "../../../features/admin/dashboard/pages/CompanyApprovalManagement";
import CompanyDetailsReview from "../../../features/admin/dashboard/pages/CompanyReqDetails";

const AdminRoutes = () => {
  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="companies" element={<CompanyManagement />} />
            <Route
              path="companies-verify-requests"
              element={<CompanyApprovalManagement />}
            />
            <Route
              path="/companies-verify-request/:id"
              element={<CompanyDetailsReview />}
            />
            <Route path="users" element={<UserManagement />} />
            <Route path="jobs" element={<JobManagement />} />
            <Route path="audit-report" element={<AuditReports />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default AdminRoutes;
