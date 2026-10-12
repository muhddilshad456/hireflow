import { Outlet } from "react-router-dom";
import { Header } from "./AdminLayout";

export function AdminHeaderLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
