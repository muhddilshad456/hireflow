import { Outlet } from "react-router-dom";
import { Header } from "../../../features/user/shared/components/Header";

function UserLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default UserLayout;
