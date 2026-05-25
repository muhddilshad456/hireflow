import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks/reduxHooks";
import { logout } from "../../../../redux/slice/authSlice";
import { logoutApi } from "../../../../features/shared/services/authService";
import toast from "react-hot-toast";
import { Ico } from "../../../../assets/icons/CompanyIcons";
import { ConfirmModal } from "../../../../features/shared/components/ConfirmationModal";
import { ProfileDropdown } from "../../../../features/shared/components/ProfileDropdown";
import type { ReactNode } from "react";
import { VerifyForm } from "../../../../features/company/admin/dashboard/components/VerifyReqForm";
import {
  getStatusApi,
  verifyRequestApi,
} from "../../../../features/company/admin/dashboard/services/comapanyServices";

type Status = "unverified" | "form" | "pending" | "approved" | "rejected";
type Page =
  | "dashboard"
  | "recruiter-invitations"
  | "recruiter"
  | "reviewer"
  | "jobs"
  | "report";

const NAV: { id: Page; label: string; icon: ReactNode; path: string }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Ico.Home />,
    path: "/company/admin/dashboard",
  },
  {
    id: "recruiter-invitations",
    label: "Recruiter Invitations",
    icon: <Ico.Users />,
    path: "/company/admin/recruiter-invitations",
  },
  {
    id: "recruiter",
    label: "Recruiter Management",
    icon: <Ico.Users />,
    path: "/recruiters",
  },
  {
    id: "reviewer",
    label: "Reviewer Management",
    icon: <Ico.Clipboard />,
    path: "/reviewers",
  },
  {
    id: "jobs",
    label: "Jobs Management",
    icon: <Ico.Briefcase />,
    path: "/jobs",
  },
  { id: "report", label: "Report", icon: <Ico.Chart />, path: "/report" },
];

/* ═══════════════════════ HEADER ════════════════════════════════════════ */
function Header({ onMenu, status }: { onMenu: () => void; status: Status }) {
  const chip =
    status === "approved"
      ? null
      : status === "pending"
        ? {
            text: "Pending Verification",
            cls: "text-amber-700 bg-amber-50 border-amber-200",
          }
        : status === "rejected"
          ? {
              text: "Verification Rejected",
              cls: "text-rose-700 bg-rose-50 border-rose-200",
            }
          : {
              text: "Company Unverified",
              cls: "text-slate-600 bg-slate-100 border-slate-200",
            };

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const logoutUser = () => setShowLogoutModal(true);
  const cancelModal = () => setShowLogoutModal(false);
  const userId = useAppSelector((state) => state.auth.user?.id);

  const handleLogout = async () => {
    if (!userId) return;
    try {
      await logoutApi({ id: userId });
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
          {/* Verification chip — hidden on small screens */}
          {chip && (
            <span
              className={`hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${chip.cls}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status === "pending"
                    ? "bg-amber-400 animate-pulse"
                    : status === "rejected"
                      ? "bg-rose-400"
                      : "bg-slate-400"
                }`}
              />
              {chip.text}
            </span>
          )}

          {/* Bell — outline style, no dot */}
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: "#555550" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <Ico.Bell />
          </button>

          {/* Dark avatar circle */}
          <ProfileDropdown
            avatarUrl={"https://i.pravatar.cc/40?img=12"}
            onProfile={() => navigate("/company/admin/profile")}
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

/* ═══════════════════════ SIDEBAR ════════════════════════════════════════ */
function Sidebar({
  active,
  onNav,
  status,
  onClose,
  isMobile,
}: {
  active: Page;
  onNav: (p: Page) => void;
  status: Status;
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

function UnverifiedOverlay({ onVerify }: { onVerify: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px]" />
      <div className="relative z-10 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm mx-0 sm:mx-4 p-8 text-center mb-0">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-200 text-white">
          <Ico.Shield />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">
          Company Not Verified
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Verify your company account to unlock the full HireFlow platform and
          start managing your hiring pipeline.
        </p>
        <ul className="text-left space-y-3 mb-7">
          {[
            "Upload company registration document",
            "Confirm your business email domain",
            "Accept platform terms of service",
          ].map((s) => (
            <li
              key={s}
              className="flex items-center gap-3 text-sm text-slate-600"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Ico.Check />
              </span>
              {s}
            </li>
          ))}
        </ul>
        <button
          onClick={onVerify}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl text-sm shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition-all"
        >
          Verify Account Now
        </button>
        <p className="text-xs text-slate-400 mt-3">
          Verification typically takes 1–2 business days
        </p>
      </div>
    </div>
  );
}

/** Pending — spinner card */
function PendingOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px]" />
      <div className="relative z-10 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm mx-0 sm:mx-4 p-8 text-center">
        {/* Animated icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-amber-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-amber-400 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <Ico.Clock />
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">
          Verification Pending
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Your request has been submitted and is under review by our admin team.
          You'll be notified once a decision is made.
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-left space-y-2">
          {[
            ["Submitted", "✓ Complete", "text-emerald-600"],
            ["Admin Review", "In progress…", "text-amber-600"],
            ["Access Granted", "Pending", "text-slate-400"],
          ].map(([label, val, cls]) => (
            <div
              key={label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-slate-600 font-medium">{label}</span>
              <span className={`font-bold text-xs ${cls}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Rejected modal */
function RejectedOverlay({ onTryAgain }: { onTryAgain: () => void }) {
  const reasons = [
    "The uploaded registration document appears to be invalid or expired.",
    "We could not verify the provided business email domain.",
    "Additional information is required to complete the verification.",
  ];
  return (
    <div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px]" />
      <div className="relative z-10 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm mx-0 sm:mx-4 p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-200 text-white">
          <Ico.XCircle />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">
          Verification Rejected
        </h2>
        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          Unfortunately, your company verification was not approved. Please
          review the reasons below and resubmit.
        </p>

        {/* Reason list */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-left space-y-2.5 mb-6">
          <p className="text-xs font-extrabold text-rose-600 uppercase tracking-wider mb-2">
            Rejection Reasons
          </p>
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-rose-200 text-rose-600 flex items-center justify-center text-[10px] font-bold mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-rose-700 leading-snug">{r}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onTryAgain}
          className="w-full py-3.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold rounded-2xl text-sm hover:from-slate-800 hover:to-slate-900 transition-all flex items-center justify-center gap-2"
        >
          <Ico.Refresh />
          Try Again
        </button>
        <p className="text-xs text-slate-400 mt-3">
          Ensure all documents are valid before resubmitting
        </p>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [page, setPage] = useState<Page>("dashboard");
  const [status, setStatus] = useState<Status>("unverified");
  const [showForm, setShowForm] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [verification, setVerification] = useState<{
    status: string;
    adminNote?: string;
  } | null>(null);

  /* Demo: wire pending overlay's approve/reject buttons via event delegation */
  const handlePendingClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const tgt = e.target as HTMLElement;
    const btn = tgt.closest("button");
    if (btn?.id === "demo-approve") setStatus("approved");
    if (btn?.id === "demo-reject") setStatus("rejected");
  };

  const handleVerificationSubmitted = async (data: FormData) => {
    try {
      const result = await verifyRequestApi(data, "NEW");

      toast.success("verification requested");

      console.log(result);

      setShowForm(false);
      setVerification({
        status: "pending",
      });
    } catch (error: any) {
      console.log("company verify req error", error.response?.data);
    }
  };

  useEffect(() => {
    async function getStatus() {
      let result = await getStatusApi("NEW");
      setVerification(result.data);
      console.log(result);
    }
    getStatus();
  }, [showForm]);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* 🔹 HEADER (FULL WIDTH) */}
      <Header onMenu={() => setMobileOpen(true)} status={status} />

      {/* 🔹 BELOW HEADER */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex flex-shrink-0 shadow-sm">
          <Sidebar active={page} onNav={setPage} status={status} />
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div
            className="flex-1 relative overflow-hidden"
            onClick={status === "pending" ? handlePendingClick : undefined}
          >
            <div className="h-full overflow-y-auto">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <Outlet />
              </div>
            </div>

            {/* Overlays */}
            {verification?.status === "not_submitted" && (
              <UnverifiedOverlay onVerify={() => setShowForm(true)} />
            )}
            {verification?.status === "pending" && <PendingOverlay />}
            {verification?.status === "rejected" && (
              <RejectedOverlay
                onTryAgain={() => {
                  setStatus("unverified");
                  setShowForm(true);
                }}
              />
            )}
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
              status={status}
              onClose={() => setMobileOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Verification Form */}
      {showForm && (
        <VerifyForm
          onSubmit={handleVerificationSubmitted}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
