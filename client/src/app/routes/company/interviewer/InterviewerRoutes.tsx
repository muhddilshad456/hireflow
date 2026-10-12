import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "../../../../features/company/recruiter/dashboard/pages/Dashboard";
import ProtectedRoute from "../../../../routes/ProtectedRoute";
import { InterviewerLayout } from "./InterviewerLayout";
import InterviewerProfilePage from "../../../../features/company/interviewer/profile/pages/InterviewerProfilePage";
import { InterviewRequestsPage } from "../../../../features/company/interviewer/interview-requests/pages/InterviewRequests";
import { InterviewsPage } from "../../../../features/company/interviewer/interviews/pages/Interviews";
import { InterviewDetailsPage } from "../../../../features/company/interviewer/interviews/pages/InterviewDetails";
import { InterviewerInterviewPage } from "../../../../features/company/interviewer/interviews/pages/InterviewerInterviewPage";

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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="interviews" element={<InterviewsPage />} />
          <Route path="interviews/:id" element={<InterviewDetailsPage />} />
          <Route
            path="interview-requests"
            element={<InterviewRequestsPage />}
          />
          <Route path="profile" element={<InterviewerProfilePage />} />
        </Route>
        <Route path="interview/:id" element={<InterviewerInterviewPage />} />
      </Route>
    </Routes>
  );
};

export default InterviewerRoutes;
