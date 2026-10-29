import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks/reduxHooks";
import { logout } from "../../../../redux/slice/authSlice";
import { logoutApi } from "../../../../features/shared/services/authService";
import toast from "react-hot-toast";
import { Ico } from "../../../../assets/icons/CompanyIcons";
import { ConfirmModal } from "../../../../features/shared/components/ConfirmationModal";
import { ProfileDropdown } from "../../../../features/shared/components/ProfileDropdown";
import type { ReactNode } from "react";
import { NotificationBell } from "../../../../features/shared/components/NotificationBell";

type Page = "dashboard" | "interviews" | "interview-requests";

const NAV: { id: Page; label: string; icon: ReactNode; path: string }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Ico.Home />,
    path: "/company/interviewer/dashboard",
  },
  {
    id: "interviews",
    label: "Interviews",
    icon: <Ico.Clipboard />,
    path: "/company/interviewer/interviews",
  },
  {
    id: "interview-requests",
    label: "Interview Requests",
    icon: <Ico.Briefcase />,
    path: "/company/interviewer/interview-requests",
  },
];

/* ═══════════════════════ HEADER ════════════════════════════════════════ */
export function Header({ onMenu }: { onMenu: () => void }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const logoutUser = () => setShowLogoutModal(true);
  const cancelModal = () => setShowLogoutModal(false);
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    if (!user?.id) return;
    try {
      await logoutApi({ id: user?.id });
      dispatch(logout());
      toast.success("Logged out");
      navigate("/company/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <header className="h-14 flex items-center px-6 bg-slate-100">
        {/* Mobile hamburger */}
        <button
          onClick={onMenu}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-black/5 transition-colors"
        >
          <Ico.Menu />
        </button>

        {/* ✦ HireFlow logo */}
        <div className="flex items-center gap-1.5 select-none">
          <span style={{ color: "#1a1a1a", fontSize: "13px", lineHeight: 1 }}>
            ✦
          </span>
          <span
            className="font-black text-[15px] tracking-tight"
            style={{ color: "#1a1a1a" }}
          >
            HireFlow
          </span>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2.5">
          <NotificationBell
            viewAllRoute="/company/interviewer/notifications"
            buttonClassName="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#F4522A]"
          />

          {/* Dark avatar circle */}
          <ProfileDropdown
            avatarUrl={user?.profilePicture ?? ""}
            onProfile={() => navigate("/company/interviewer/profile")}
            onLogout={logoutUser}
            name={user?.name ?? ""}
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

/* ═══════════════════════ SIDEBAR ════════════════════════════════════════ */
function Sidebar({
  onClose,
  isMobile,
}: {
  active: Page;
  onNav: (p: Page) => void;
  onClose?: () => void;
  isMobile?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Brand row — only shown on mobile drawer (desktop header has the logo) */}
      {isMobile && (
        <div
          className="flex items-center justify-between h-14 px-5 flex-shrink-0"
          style={{ borderBottom: "1px solid #e0e0da" }}
        >
          <div className="flex items-center gap-1.5 select-none">
            <span style={{ color: "#1a1a1a", fontSize: "15px" }}>✦</span>
            <span
              className="font-black text-[15px] tracking-tight"
              style={{ color: "#1a1a1a" }}
            >
              HireFlow
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Ico.X />
            </button>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pt-5 pb-3 space-y-0.5">
        {NAV.map((n) => {
          const isActive = location.pathname === n.path;
          return (
            <button
              key={n.id}
              onClick={() => {
                navigate(n.path);
                onClose?.();
              }}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
              style={{
                backgroundColor: isActive ? "#e2e8e2" : "transparent",
                color: isActive ? "#1a1a1a" : "#555550",
                fontWeight: isActive ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#e8e8e3";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
              }}
            >
              <span
                className="flex-shrink-0 w-4 h-4"
                style={{ color: isActive ? "#1a1a1a" : "#888884" }}
              >
                {n.icon}
              </span>
              <span className="truncate text-[13px]">{n.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function InterviewerLayout() {
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* 🔹 HEADER (FULL WIDTH) */}
      <Header onMenu={() => setMobileOpen(true)} />

      {/* 🔹 BELOW HEADER */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex flex-shrink-0 shadow-sm">
          <Sidebar active={page} onNav={setPage} />
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            <div className="h-full overflow-y-auto">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer stays same */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar
              active={page}
              onNav={setPage}
              onClose={() => setMobileOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}
    </div>
  );
}
