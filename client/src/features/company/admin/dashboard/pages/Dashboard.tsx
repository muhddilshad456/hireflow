import { useState, useRef } from "react";
import type { ReactNode, ChangeEvent } from "react";
import type { VerificationFormData } from "../types/verification.types";
import { verifyRequestApi } from "../services/comapanyServices";
import toast from "react-hot-toast";

/* ═══════════════════════════════ TYPES ════════════════════════════════ */
type Page = "dashboard" | "recruiter" | "reviewer" | "jobs" | "report";
type Status = "unverified" | "form" | "pending" | "approved" | "rejected";

interface FormErrors {
  [k: string]: string;
}

/* ═══════════════════════════════ ICONS ════════════════════════════════ */
const Ico = {
  Logo: () => (
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
      <rect width="36" height="36" rx="10" fill="url(#lg)" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="36" y2="36">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path
        d="M9 22l7-9 4.5 5.5 3.5-4 6 7.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="11" r="3.5" fill="white" opacity="0.95" />
    </svg>
  ),
  Home: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[18px] h-[18px]"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Users: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[18px] h-[18px]"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Clipboard: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[18px] h-[18px]"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  ),
  Briefcase: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[18px] h-[18px]"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Chart: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[18px] h-[18px]"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  Bell: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[18px] h-[18px]"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Search: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Shield: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-9 h-9"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Clock: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-9 h-9"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  X: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  XCircle: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-9 h-9"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  Menu: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Upload: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  ),
  Plus: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trend: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Logout: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Person: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Mail: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Code: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Refresh: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
};

/* ═══════════════════════════ DASHBOARD DATA ═══════════════════════════ */
const JOBS = [
  {
    title: "Senior Software Engineer",
    cat: "Engineering",
    status: "Open" as const,
    apps: 120,
  },
  {
    title: "Product Manager",
    cat: "Product",
    status: "Open" as const,
    apps: 85,
  },
  {
    title: "UX/UI Designer",
    cat: "Design",
    status: "Closed" as const,
    apps: 60,
  },
  {
    title: "Data Analyst",
    cat: "Analytics",
    status: "Open" as const,
    apps: 95,
  },
];
const FEED = [
  {
    ic: <Ico.Person />,
    text: "New candidate applied for Senior Software Engineer",
    t: "2 hours ago",
    dot: "bg-emerald-400",
  },
  {
    ic: <Ico.Mail />,
    text: "Offer sent to candidate for Product Manager",
    t: "4 hours ago",
    dot: "bg-amber-400",
  },
  {
    ic: <Ico.Code />,
    text: "Candidate moved to Technical Round for UX/UI Designer",
    t: "6 hours ago",
    dot: "bg-violet-400",
  },
  {
    ic: <Ico.Briefcase />,
    text: "New job post created: Data Analyst",
    t: "8 hours ago",
    dot: "bg-sky-400",
  },
  {
    ic: <Ico.Person />,
    text: "Candidate rejected for Senior Software Engineer",
    t: "10 hours ago",
    dot: "bg-rose-400",
  },
];
const CAT: Record<string, string> = {
  Engineering: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Product: "text-amber-700 bg-amber-50 border-amber-200",
  Design: "text-violet-700 bg-violet-50 border-violet-200",
  Analytics: "text-sky-700 bg-sky-50 border-sky-200",
};
const NAV: { id: Page; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <Ico.Home /> },
  { id: "recruiter", label: "Recruiter Management", icon: <Ico.Users /> },
  { id: "reviewer", label: "Reviewer Management", icon: <Ico.Clipboard /> },
  { id: "jobs", label: "Jobs Management", icon: <Ico.Briefcase /> },
  { id: "report", label: "Report", icon: <Ico.Chart /> },
];

/* ═══════════════════════ SMALL ATOMS ══════════════════════════════════ */
function Pill({ c, children }: { c: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${c}`}
    >
      {children}
    </span>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

function Input({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400
        ${error ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
    />
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
  const dot =
    status === "approved"
      ? {
          bg: "bg-emerald-500",
          text: "Verified",
          tx: "text-emerald-700",
          card: "bg-emerald-50 border-emerald-100",
        }
      : status === "pending"
        ? {
            bg: "bg-amber-400",
            text: "Pending Review",
            tx: "text-amber-700",
            card: "bg-amber-50 border-amber-200",
          }
        : status === "rejected"
          ? {
              bg: "bg-rose-500",
              text: "Rejected",
              tx: "text-rose-700",
              card: "bg-rose-50 border-rose-200",
            }
          : {
              bg: "bg-slate-400",
              text: "Not Verified",
              tx: "text-slate-600",
              card: "bg-slate-50 border-slate-200",
            };

  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-slate-100/80 ${isMobile ? "w-72" : "w-60 lg:w-64"}`}
    >
      {/* Brand row */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex-shrink-0">
            <Ico.Logo />
          </div>
          <span className="font-black text-slate-800 text-[17px] tracking-tight">
            HireFlow
          </span>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Ico.X />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pt-5 pb-3 space-y-0.5">
        <p className="px-3 pb-3 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">
          Main Menu
        </p>
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              onNav(n.id);
              onClose?.();
            }}
            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              active === n.id
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <span
              className={`flex-shrink-0 ${active === n.id ? "text-white" : "text-slate-400 group-hover:text-emerald-500 transition-colors"}`}
            >
              {n.icon}
            </span>
            <span className="truncate">{n.label}</span>
            {active === n.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
            )}
          </button>
        ))}
      </nav>

      {/* Status chip */}
      <div className="flex-shrink-0 px-3 pb-2 pt-2 border-t border-slate-100">
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${dot.card}`}
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${dot.bg} ${status === "pending" ? "animate-pulse" : ""}`}
          />
          <span className={`text-xs font-bold ${dot.tx}`}>{dot.text}</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 mt-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">
              Admin User
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              admin@hireflow.io
            </p>
          </div>
          <span className="text-slate-300 group-hover:text-slate-500 transition-colors">
            <Ico.Logout />
          </span>
        </div>
      </div>
    </div>
  );
}

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

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center gap-3 px-4 md:px-6 flex-shrink-0 z-10">
      <button
        onClick={onMenu}
        className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Ico.Menu />
      </button>
      <div className="md:hidden flex items-center gap-2">
        <div className="w-7 h-7">
          <Ico.Logo />
        </div>
        <span className="font-black text-slate-800 text-base">HireFlow</span>
      </div>

      <div className="hidden sm:flex flex-1 max-w-xs items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
        <span className="text-slate-400">
          <Ico.Search />
        </span>
        <input
          className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
          placeholder="Search jobs, candidates…"
        />
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {chip && (
          <span
            className={`hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${chip.cls}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${status === "pending" ? "bg-amber-400 animate-pulse" : status === "rejected" ? "bg-rose-400" : "bg-slate-400"}`}
            />
            {chip.text}
          </span>
        )}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors">
          <Ico.Bell />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-black select-none cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════ VERIFY FORM MODAL ═════════════════════════════ */
const EMPTY: VerificationFormData = {
  companyName: "",
  regNumber: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  description: "",
  country: "",
  state: "",
  city: "",
  zip: "",
};

function VerifyForm({
  onSubmit,
  onClose,
}: {
  onSubmit: () => void;
  onClose: () => void;
}) {
  const [fd, setFd] = useState<VerificationFormData>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<FormErrors>({});
  const [loading, setLd] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set =
    (k: keyof VerificationFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFd((p: VerificationFormData) => ({ ...p, [k]: e.target.value }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!fd.companyName.trim()) e.companyName = "Company name is required";
    if (!fd.regNumber.trim()) e.regNumber = "Registration number is required";
    if (!fd.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.email))
      e.email = "Enter a valid email address";
    if (!fd.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,}$/.test(fd.phone))
      e.phone = "Enter a valid phone number";
    if (fd.website && !/^https?:\/\/.+/.test(fd.website))
      e.website = "URL must start with http:// or https://";
    if (!fd.address.trim()) e.address = "Business address is required";
    if (!fd.description.trim())
      e.description = "Company description is required";
    if (!file) {
      e.document = "Document required";
    }
    if (!fd.country.trim()) e.country = "Country is required";
    if (!fd.state.trim()) e.state = "State is required";
    if (!fd.city.trim()) e.city = "City is required";
    if (!fd.zip.trim()) e.zip = "ZIP / Postal code is required";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // 🔹 validate (optional but recommended)
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Invalid file type");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File too large (max 10MB)");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const formData = new FormData();

      Object.entries(fd).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append("document", file as File);

      const result = await verifyRequestApi(formData);

      toast.success("verification requested");

      console.log(result);
      onSubmit();
    } catch (error: any) {
      console.log("company verify req error", error.response?.data);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              Verify Your Company
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in the details below to submit your verification request
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Ico.X />
          </button>
        </div>

        {/* Form body */}
        <div className="overflow-y-auto px-7 py-5 space-y-4 flex-1">
          {/* Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name *" error={err.companyName}>
              <Input
                value={fd.companyName}
                onChange={set("companyName")}
                placeholder="Acme Corp."
                error={err.companyName}
              />
            </Field>
            <Field label="Registration Number *" error={err.regNumber}>
              <Input
                value={fd.regNumber}
                onChange={set("regNumber")}
                placeholder="REG-123456"
                error={err.regNumber}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Business Email *" error={err.email}>
              <Input
                type="email"
                value={fd.email}
                onChange={set("email")}
                placeholder="contact@company.com"
                error={err.email}
              />
            </Field>
            <Field label="Phone Number *" error={err.phone}>
              <Input
                type="tel"
                value={fd.phone}
                onChange={set("phone")}
                placeholder="+1 234 567 8900"
                error={err.phone}
              />
            </Field>
          </div>

          <Field label="Company Description *" error={err.description}>
            <textarea
              value={fd.description}
              onChange={set("description")}
              rows={3}
              placeholder="Briefly describe your company..."
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 resize-none
      ${err.description ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            />
          </Field>

          <Field label="Website" error={err.website}>
            <Input
              value={fd.website}
              onChange={set("website")}
              placeholder="https://company.com"
              error={err.website}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Country *" error={err.country}>
              <Input
                value={fd.country}
                onChange={set("country")}
                placeholder="India"
                error={err.country}
              />
            </Field>

            <Field label="State *" error={err.state}>
              <Input
                value={fd.state}
                onChange={set("state")}
                placeholder="Kerala"
                error={err.state}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="City *" error={err.city}>
              <Input
                value={fd.city}
                onChange={set("city")}
                placeholder="Calicut"
                error={err.city}
              />
            </Field>

            <Field label="ZIP / Postal Code *" error={err.zip}>
              <Input
                value={fd.zip}
                onChange={set("zip")}
                placeholder="673001"
                error={err.zip}
              />
            </Field>
          </div>

          <Field label="Business Address *" error={err.address}>
            <textarea
              value={fd.address}
              onChange={set("address")}
              rows={2}
              placeholder="123 Main St, City, State, ZIP"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 resize-none
                ${err.address ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            />
          </Field>

          {/* File upload */}
          <Field label="Registration Document *" error={err.docName}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed transition-colors
                ${err.docName ? "border-rose-300 bg-rose-50" : file?.name ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/50"}`}
            >
              <span
                className={file?.name ? "text-emerald-500" : "text-slate-400"}
              >
                <Ico.Upload />
              </span>
              {file ? (
                <p className="text-xs font-bold text-emerald-700">
                  {file.name}
                </p>
              ) : (
                <>
                  <p className="text-xs font-semibold text-slate-600">
                    Click to upload PDF or image
                  </p>
                  <p className="text-[10px] text-slate-400">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFile}
              className="hidden"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-100 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Verification"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ OVERLAYS ══════════════════════════════════════ */

/** Unverified — blurred bg + single CTA */
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

        {/* Demo buttons for admin simulation */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">
            — Demo: Simulate admin decision —
          </p>
          <div className="flex gap-2">
            <button
              id="demo-approve"
              className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
            >
              ✓ Approve
            </button>
            <button
              id="demo-reject"
              className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
            >
              ✗ Reject
            </button>
          </div>
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

/* ═══════════════════════ PAGES ════════════════════════════════════════ */
function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: ReactNode;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
        {label}
      </p>
      <p className="text-3xl font-black text-slate-800 tabular-nums leading-none">
        {value}
      </p>
      {trend && (
        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <Ico.Trend />
          {trend}
        </p>
      )}
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Welcome back — here's what's happening today.
          </p>
        </div>
        <button className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-200 transition-colors flex-shrink-0 hover:from-emerald-600 hover:to-teal-600">
          <Ico.Plus />
          Post a Job
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Active Job Posts" value={15} trend="+3 this week" />
        <StatCard label="Total Applications" value={350} trend="+28 today" />
        <StatCard label="Shortlisted" value={75} />
        <StatCard label="Candidates Hired" value={10} trend="This month" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <h2 className="font-bold text-slate-700">Active Jobs Overview</h2>
          <button className="text-xs font-semibold text-emerald-600 hover:underline">
            View All Jobs
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {["Job Title", "Category", "Status", "Applications", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider first:pl-6 last:pr-6"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {JOBS.map((j, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 pl-6 py-3.5 font-semibold text-slate-700">
                    {j.title}
                  </td>
                  <td className="px-5 py-3.5">
                    <Pill c={CAT[j.cat]}>{j.cat}</Pill>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${j.status === "Open" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${j.status === "Open" ? "bg-emerald-500" : "bg-slate-400"}`}
                      />
                      {j.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-600">
                    {j.apps}
                  </td>
                  <td className="px-5 pr-6 py-3.5 text-right">
                    <button className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                      View Job
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="font-bold text-slate-700">Recent Activity Feed</h2>
        </div>
        <ul className="divide-y divide-slate-50">
          {FEED.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mt-0.5">
                {f.ic}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 font-medium leading-snug">
                  {f.text}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{f.t}</p>
              </div>
              <span
                className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${f.dot}`}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PlaceholderPage({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">{desc}</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-5">
          {icon}
        </div>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
          {desc}
        </p>
        <button className="mt-6 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl transition-colors shadow-sm hover:from-emerald-600 hover:to-teal-600">
          Get Started
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ ROOT APP ══════════════════════════════════════ */
export default function HireFlow() {
  const [page, setPage] = useState<Page>("dashboard");
  const [status, setStatus] = useState<Status>("unverified");
  const [showForm, setShowForm] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Demo: wire pending overlay's approve/reject buttons via event delegation */
  const handlePendingClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const tgt = e.target as HTMLElement;
    const btn = tgt.closest("button");
    if (btn?.id === "demo-approve") setStatus("approved");
    if (btn?.id === "demo-reject") setStatus("rejected");
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage />;
      case "recruiter":
        return (
          <PlaceholderPage
            title="Recruiter Management"
            desc="Manage recruiters, assign roles, and track performance."
            icon={<Ico.Users />}
          />
        );
      case "reviewer":
        return (
          <PlaceholderPage
            title="Reviewer Management"
            desc="Add reviewers, set criteria, and manage feedback."
            icon={<Ico.Clipboard />}
          />
        );
      case "jobs":
        return (
          <PlaceholderPage
            title="Jobs Management"
            desc="Create and manage all job postings and hiring stages."
            icon={<Ico.Briefcase />}
          />
        );
      case "report":
        return (
          <PlaceholderPage
            title="Reports & Analytics"
            desc="Detailed insights on your hiring pipeline performance."
            icon={<Ico.Chart />}
          />
        );
    }
  };

  return (
    <div
      className="flex h-screen bg-slate-50 overflow-hidden"
      style={{
        fontFamily: "'Plus Jakarta Sans','DM Sans',ui-sans-serif,sans-serif",
      }}
    >
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-full shadow-sm">
        <Sidebar active={page} onNav={setPage} status={status} />
      </div>

      {/* Mobile drawer */}
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

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenu={() => setMobileOpen(true)} status={status} />

        {/* Content */}
        <div
          className="flex-1 relative overflow-hidden"
          onClick={status === "pending" ? handlePendingClick : undefined}
        >
          {/* Scrollable page — disabled when locked */}
          <div
            className={`h-full ${status !== "approved" ? "overflow-hidden" : "overflow-y-auto"}`}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {renderPage()}
            </div>
          </div>

          {/* ── Overlays ── */}
          {status === "unverified" && (
            <UnverifiedOverlay onVerify={() => setShowForm(true)} />
          )}
          {status === "pending" && <PendingOverlay />}
          {status === "rejected" && (
            <RejectedOverlay
              onTryAgain={() => {
                setStatus("unverified");
                setShowForm(true);
              }}
            />
          )}
        </div>
      </div>
      {/* ── Verification Form (slides over everything) ── */}
      {showForm && (
        <VerifyForm
          onSubmit={() => {
            setShowForm(false);
            setStatus("pending");
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
