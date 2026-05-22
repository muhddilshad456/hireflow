import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { Dashboard } from "../../../../features/company/admin/dashboard/pages/Dashboard";
import { RecruiterInvitations } from "../../../../features/company/admin/dashboard/pages/RecruiterInvitations";
import ProtectedRoute from "../../../../routes/ProtectedRoute";
import ProfilePage from "../../../../features/company/admin/profile/pages/Profile";

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
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
