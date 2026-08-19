import { Routes, Route, Navigate } from "react-router-dom";
import { RecruiterLayout } from "./RecruiterLayout";
import { Dashboard } from "../../../../features/company/recruiter/dashboard/pages/Dashboard";
import ProtectedRoute from "../../../../routes/ProtectedRoute";
import JobManagement from "../../../../features/company/recruiter/jobmanagement/pages/JobManagement";
import { JobLayout } from "../../../../features/company/recruiter/jobmanagement/pages/JobDetailsLayout";
import { StageRenderer } from "../../../../features/company/recruiter/jobmanagement/components/StageRenderer";
import { AiFilterResultsPage } from "../../../../features/company/recruiter/ai-filter/pages/AiFilter";

const RecruiterRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["company_recruiter"]}
            redirectTo="/company/login"
          />
        }
      >
        <Route path="/" element={<RecruiterLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="job-management" element={<JobManagement />} />
          <Route
            path="job/:jobId/ai-filter-results"
            element={<AiFilterResultsPage />}
          />
          <Route path="job/:jobId" element={<JobLayout />}>
            <Route index element={<Navigate to="stage/first" replace />} />
            <Route path="stage/:stageId" element={<StageRenderer />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default RecruiterRoutes;
