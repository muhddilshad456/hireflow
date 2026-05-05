import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks/reduxHooks";
import { ProfileDropdown } from "../../../shared/components/ProfileDropdown";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../../../shared/components/ConfirmationModal";
import { logout } from "../../../../redux/slice/authSlice";
import { logoutApi } from "../../../shared/services/authService";
import toast from "react-hot-toast";

const IcoBell = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IcoMenu = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export function Header({
  onMenuClick,
  avatarUrl = "https://i.pravatar.cc/40?img=12",
  notifications = 3,
}: {
  onMenuClick: () => void;
  avatarUrl?: string;
  notifications?: number;
}) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const logoutUser = () => setShowLogoutModal(true);
  const cancelModal = () => setShowLogoutModal(false);
  const userId = useAppSelector((state) => state.auth.user?.id);

  const handleLogout = async () => {
    if (!userId) {
      console.log("userId not accesible");
      return;
    }
    try {
      await logoutApi({ id: userId });
      dispatch(logout());
      toast.success("Logged out");
      navigate("/admin/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 px-4 md:px-6 flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={onMenuClick}
          >
            <IcoMenu />
          </button>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <IcoBell />
            {notifications > 0 && (
              <span className="absolute top-0.5 right-0.5 w-[15px] h-[15px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {notifications > 9 ? "9+" : notifications}
              </span>
            )}
          </button>
          <ProfileDropdown
            avatarUrl={avatarUrl}
            onProfile={() => navigate("/profile")}
            onLogout={logoutUser}
          />
        </div>
      </header>
      <ConfirmModal
        open={showLogoutModal}
        message="Do you want to logout"
        title="Logout"
        onConfirm={handleLogout}
        onCancel={cancelModal}
      />
    </>
  );
}
