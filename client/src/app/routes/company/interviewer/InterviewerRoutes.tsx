import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../../../../routes/ProtectedRoute";
import { InterviewerLayout } from "./InterviewerLayout";
import InterviewerProfilePage from "../../../../features/company/interviewer/profile/pages/InterviewerProfilePage";
import { InterviewRequestsPage } from "../../../../features/company/interviewer/interview-requests/pages/InterviewRequests";
import { InterviewsPage } from "../../../../features/company/interviewer/interviews/pages/Interviews";
import { InterviewDetailsPage } from "../../../../features/company/interviewer/interviews/pages/InterviewDetails";
import { InterviewerInterviewPage } from "../../../../features/company/interviewer/interviews/pages/InterviewerInterviewPage";
import NotificationsPage from "../../../../features/shared/pages/NotificationPage";
import { InterviewerDashboard } from "../../../../features/company/interviewer/dashboard/pages/Dashboard";

const InterviewerRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["company_interviewer"]}
            redirectTo="/company/login"
          />
        }
      >
        <Route path="/" element={<InterviewerLayout />}>
          <Route path="dashboard" element={<InterviewerDashboard />} />
          <Route path="interviews" element={<InterviewsPage />} />
          <Route path="interviews/:id" element={<InterviewDetailsPage />} />
          <Route
            path="interview-requests"
            element={<InterviewRequestsPage />}
          />
          <Route path="profile" element={<InterviewerProfilePage />} />
        </Route>
        <Route path="interview/:id" element={<InterviewerInterviewPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  );
};

export default InterviewerRoutes;
