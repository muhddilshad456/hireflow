import { useNavigate, useLocation } from "react-router-dom";

// SVG Icon
const IcoClose = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IcoDash = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IcoCompany = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IcoUser = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IcoJob = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const IcoAudit = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { path: "/admin/dashboard", label: "Dashboard", icon: <IcoDash /> },
  {
    path: "/admin/companies",
    label: "Company Management",
    icon: <IcoCompany />,
  },
  {
    path: "/admin/companies-verify-requests",
    label: "Company Approvals",
    icon: <IcoCompany />,
  },
  {
    path: "/admin/companies-edit-requests",
    label: "Company Edit Approvals",
    icon: <IcoCompany />,
  },
  { path: "/admin/users", label: "User Management", icon: <IcoUser /> },
  { path: "/admin/jobs", label: "Job Management", icon: <IcoJob /> },
  {
    path: "/admin/audit-report",
    label: "Audit & Reports",
    icon: <IcoAudit />,
  },
];

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const inner = (
    <div className="w-56 bg-white h-full flex flex-col border-r border-gray-100">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
        <span className="text-[22px] font-bold tracking-tight select-none">
          <span className="text-red-500">Hire</span>
          <span className="text-gray-800">Flow</span>
        </span>
        <button
          className="md:hidden text-gray-400 hover:text-gray-700 transition-colors"
          onClick={onClose}
        >
          <IcoClose />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ path, label, icon }) => {
          const active = isActive(path);

          return (
            <button
              key={path}
              onClick={() => {
                navigate(path);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-left transition-all duration-150
        ${
          active
            ? "bg-violet-100 text-violet-700"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
        }`}
            >
              <span
                className={`shrink-0 ${
                  active ? "text-violet-600" : "text-gray-400"
                }`}
              >
                {icon}
              </span>
              <span className="truncate leading-tight">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex shrink-0 shadow-sm">{inner}</aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="shadow-2xl">{inner}</div>
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
        </div>
      )}
    </>
  );
}
