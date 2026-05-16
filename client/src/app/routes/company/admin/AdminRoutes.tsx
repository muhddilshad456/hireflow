import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { Dashboard } from "../../../../features/company/admin/dashboard/pages/Dashboard";
import { RecruiterInvitations } from "../../../../features/company/admin/dashboard/pages/RecruiterInvitations";
import ProtectedRoute from "../../../../routes/ProtectedRoute";

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
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
