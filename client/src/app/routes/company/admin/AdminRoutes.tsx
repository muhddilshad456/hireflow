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
import NotificationsPage from "../../../../features/shared/pages/NotificationPage";
import { RecruiterManagement } from "../../../../features/company/admin/recruiter-management/pages/RecruiterManagement";
import { InterviewerManagement } from "../../../../features/company/admin/interviewer-management/pages/InterviewerManagement";
import { JobManagement } from "../../../../features/company/admin/job-management/pages/Jobs";

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
          <Route path="recruiters" element={<RecruiterManagement />} />
          <Route path="interviewers" element={<InterviewerManagement />} />
          <Route path="jobs" element={<JobManagement />} />
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
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
