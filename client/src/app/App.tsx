import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import UserRoutes from "./routes/user/UserRoutes";
import CompanyRoutes from "./routes/company/CompanyRoutes";
import AdminRoutes from "./routes/admin/AdminRoutes";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/*" element={<UserRoutes />} />
        <Route path="/company/*" element={<CompanyRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </>
  );
}

export default App;
