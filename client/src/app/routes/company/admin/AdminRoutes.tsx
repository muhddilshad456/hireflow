import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { Dashboard } from "../../../../features/company/admin/dashboard/pages/Dashboard";
import { RecruiterInvitations } from "../../../../features/company/admin/recruiter-management/pages/RecruiterInvitations";
import ProtectedRoute from "../../../../routes/ProtectedRoute";
import ProfilePage from "../../../../features/company/admin/profile/pages/Profile";
import { InterviewerInvitations } from "../../../../features/company/admin/interviewer-management/pages/InterviewerInvitations";
import { AdminHeaderLayout } from "./AdminHeaderLayout";
import { SubscriptionCancelPage } from "../../../../features/company/admin/subscription/pages/SubscriptionCancel";
import { SubscriptionSuccessPage } from "../../../../features/company/admin/subscription/pages/SubscriptionSuccess";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["company_admin"]}
            redirectTo="/company/login"
          />
        }
      >
        <Route path="/" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="recruiter-invitations"
            element={<RecruiterInvitations />}
          />
          <Route
            path="interviewer-invitations"
            element={<InterviewerInvitations />}
          />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route element={<AdminHeaderLayout />}>
          <Route
            path="subscription/success"
            element={<SubscriptionSuccessPage />}
          />
          <Route
            path="subscription/cancel"
            element={<SubscriptionCancelPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
