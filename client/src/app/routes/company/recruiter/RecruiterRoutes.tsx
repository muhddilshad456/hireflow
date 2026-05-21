import { Routes, Route } from "react-router-dom";
import { RecruiterLayout } from "./RecruiterLayout";
import { Dashboard } from "../../../../features/company/recruiter/dashboard/pages/Dashboard";
import ProtectedRoute from "../../../../routes/ProtectedRoute";
import JobManagement from "../../../../features/company/recruiter/jobmanagement/pages/JobManagement";

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
        </Route>
      </Route>
    </Routes>
  );
};

export default RecruiterRoutes;
