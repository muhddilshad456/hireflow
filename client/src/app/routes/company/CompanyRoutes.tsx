import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminRoutes from "./admin/AdminRoutes";

const CompanyRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/*" element={<AdminRoutes />} />
      </Routes>
    </>
  );
};

export default CompanyRoutes;
