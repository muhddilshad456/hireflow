import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../../hooks/reduxHooks";
import { logoutApi } from "../../../shared/services/authService";
import { logout } from "../../../../redux/slice/authSlice";
import toast from "react-hot-toast";
import { ProfileDropdown } from "../../../shared/components/ProfileDropdown";
import { ConfirmModal } from "../../../shared/components/ConfirmationModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type JobTag = "Full-time" | "Remote" | "Hybrid" | "Part-time";
type JobType = "Popular" | "Professional" | "Non Professional";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: JobType;
  tag: JobTag;
  salary: string;
  posted: string;
  applicants: number;
  skills: string[];
}

interface StatItem {
  label: string;
  value: string;
  color: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const jobs: Job[] = [
  {
    id: 1,
    title: "Java Developer",
    company: "Wipro",
    location: "Chennai, India",
    type: "Popular",
    tag: "Full-time",
    salary: "₹12–18 LPA",
    posted: "2d ago",
    applicants: 142,
    skills: ["Java", "Spring Boot", "MySQL"],
  },
  {
    id: 2,
    title: "React Engineer",
    company: "Infosys",
    location: "Bengaluru, India",
    type: "Popular",
    tag: "Remote",
    salary: "₹15–22 LPA",
    posted: "1d ago",
    applicants: 89,
    skills: ["React", "TypeScript", "Node.js"],
  },
  {
    id: 3,
    title: "Python Developer",
    company: "TCS",
    location: "Hyderabad, India",
    type: "Popular",
    tag: "Hybrid",
    salary: "₹10–16 LPA",
    posted: "3d ago",
    applicants: 204,
    skills: ["Python", "Django", "PostgreSQL"],
  },
  {
    id: 4,
    title: "Product Manager",
    company: "Zoho",
    location: "Chennai, India",
    type: "Professional",
    tag: "Full-time",
    salary: "₹20–30 LPA",
    posted: "5h ago",
    applicants: 56,
    skills: ["Roadmapping", "Agile", "Analytics"],
  },
  {
    id: 5,
    title: "UX Designer",
    company: "Freshworks",
    location: "Chennai, India",
    type: "Professional",
    tag: "Hybrid",
    salary: "₹14–20 LPA",
    posted: "1d ago",
    applicants: 73,
    skills: ["Figma", "Prototyping", "Research"],
  },
  {
    id: 6,
    title: "Data Analyst",
    company: "HCL",
    location: "Noida, India",
    type: "Professional",
    tag: "Remote",
    salary: "₹8–13 LPA",
    posted: "4d ago",
    applicants: 118,
    skills: ["SQL", "Power BI", "Excel"],
  },
  {
    id: 7,
    title: "Customer Support",
    company: "Teleperformance",
    location: "Mumbai, India",
    type: "Non Professional",
    tag: "Full-time",
    salary: "₹3–5 LPA",
    posted: "2d ago",
    applicants: 310,
    skills: ["Communication", "CRM", "English"],
  },
  {
    id: 8,
    title: "Data Entry Operator",
    company: "iEnergizer",
    location: "Delhi, India",
    type: "Non Professional",
    tag: "Part-time",
    salary: "₹2–4 LPA",
    posted: "6h ago",
    applicants: 185,
    skills: ["MS Office", "Typing", "Accuracy"],
  },
];

const tagColors: Record<JobTag, string> = {
  "Full-time": "bg-emerald-50 text-emerald-700 border-emerald-100",
  Remote: "bg-blue-50   text-blue-700   border-blue-100",
  Hybrid: "bg-violet-50 text-violet-700 border-violet-100",
  "Part-time": "bg-amber-50  text-amber-700  border-amber-100",
};

const brandGradients: Record<string, string> = {
  Wipro: "from-blue-500   to-blue-700",
  Infosys: "from-indigo-500 to-indigo-700",
  TCS: "from-sky-500    to-sky-700",
  Zoho: "from-red-400    to-red-600",
  Freshworks: "from-green-500  to-green-700",
  HCL: "from-teal-500   to-teal-700",
  Teleperformance: "from-orange-400 to-orange-600",
  iEnergizer: "from-pink-400   to-pink-600",
};

const tabs: string[] = [
  "Popular Jobs",
  "Professional Jobs",
  "Non Professional Jobs",
];
const tabKeys: JobType[] = ["Popular", "Professional", "Non Professional"];

const categories: string[] = [
  "Technology",
  "Design",
  "Marketing",
  "Finance",
  "Operations",
  "HR",
];
const locationList: string[] = [
  "All India",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Mumbai",
  "Delhi",
  "Noida",
];
const salaryRanges: string[] = [
  "₹0–5 LPA",
  "₹5–15 LPA",
  "₹15–30 LPA",
  "₹30+ LPA",
];
const jobTypes: string[] = [
  "Full-time",
  "Part-time",
  "Remote",
  "Hybrid",
  "Contract",
];

const marketStats: StatItem[] = [
  { label: "New jobs today", value: "1,284", color: "text-emerald-600" },
  { label: "Companies hiring", value: "340+", color: "text-blue-600" },
  { label: "Remote openings", value: "892", color: "text-violet-600" },
];

const quickTips: string[] = [
  "Update your resume",
  "Add your portfolio",
  "Enable job alerts",
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <circle cx={11} cy={11} r={8} />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const LocationIcon = () => (
  <svg
    className="h-3 w-3"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx={12} cy={10} r={3} />
  </svg>
);

const SalaryIcon = () => (
  <svg
    className="h-3 w-3"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <line x1={12} y1={1} x2={12} y2={23} />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <line x1={18} y1={6} x2={6} y2={18} />
    <line x1={6} y1={6} x2={18} y2={18} />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="h-3.5 w-3.5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FilterIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <line x1={4} y1={6} x2={20} y2={6} />
    <line x1={8} y1={12} x2={16} y2={12} />
    <line x1={11} y1={18} x2={13} y2={18} />
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SidebarContentProps {
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedLocation: string;
  setSelectedLocation: (v: string) => void;
}

const SidebarContent = ({
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
}: SidebarContentProps) => (
  <div className="flex flex-col gap-4">
    {/* Categories */}
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        Categories
      </h3>
      <div className="space-y-0.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === cat
                ? "bg-orange-50 text-orange-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>

    {/* Location */}
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        Location
      </h3>
      <div className="space-y-0.5">
        {locationList.map((loc) => (
          <button
            key={loc}
            onClick={() => setSelectedLocation(loc)}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedLocation === loc
                ? "bg-orange-50 text-orange-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {loc}
          </button>
        ))}
      </div>
    </div>

    {/* Salary */}
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        Salary Range
      </h3>
      <div className="space-y-2">
        {salaryRanges.map((r) => (
          <label
            key={r}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input type="checkbox" className="accent-orange-500 w-3.5 h-3.5" />
            <span className="text-sm text-slate-600 group-hover:text-slate-800">
              {r}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* Job Type */}
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        Job Type
      </h3>
      <div className="space-y-2">
        {jobTypes.map((type) => (
          <label
            key={type}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              className="accent-orange-500 w-3.5 h-3.5"
              defaultChecked={type === "Full-time"}
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-800">
              {type}
            </span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => (
  <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-orange-50/60 border border-transparent hover:border-orange-100 transition-all group cursor-pointer">
    {/* Company logo */}
    <div
      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${
        brandGradients[job.company] ?? "from-slate-400 to-slate-600"
      } flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm`}
    >
      {job.company.slice(0, 2).toUpperCase()}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base group-hover:text-orange-500 transition-colors">
          {job.title}
        </h3>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tagColors[job.tag]}`}
        >
          {job.tag}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-0.5">{job.company}</p>
      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <LocationIcon />
          {job.location}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <SalaryIcon />
          {job.salary}
        </span>
        <span className="text-xs text-slate-300">{job.posted}</span>
      </div>
      <div className="flex gap-1 mt-2 flex-wrap">
        {job.skills.map((s) => (
          <span
            key={s}
            className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md"
          >
            {s}
          </span>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div className="shrink-0 flex flex-col items-end gap-1.5 ml-auto">
      <button className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold px-3 sm:px-4 py-2 rounded-xl transition-all shadow-sm shadow-orange-200 whitespace-nowrap">
        View Details
      </button>
      <span className="text-xs text-slate-400 whitespace-nowrap">
        {job.applicants} applicants
      </span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HireFlow() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Technology");
  const [selectedLocation, setSelectedLocation] = useState<string>("All India");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const filtered: Job[] = jobs.filter(
    (j) =>
      j.type === tabKeys[activeTab] &&
      (j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase())),
  );

  const featuredJob: Job | undefined = filtered[0];

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
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="w-full px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <span className="text-xl font-black tracking-tight shrink-0">
            <span className="text-orange-500">Hire</span>
            <span className="text-slate-800">Flow</span>
          </span>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-500 font-medium">
            {["Home", "Jobs", "Applied Jobs", "Messages"].map((item) => (
              <a
                key={item}
                href="#"
                className={`hover:text-slate-800 transition-colors pb-0.5 ${
                  item === "Home"
                    ? "text-slate-900 font-semibold border-b-2 border-orange-500"
                    : ""
                }`}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Desktop search */}
            <div className="relative hidden md:block">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <SearchIcon />
              </span>
              <input
                className="pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 w-48 lg:w-56 placeholder:text-slate-400"
                placeholder="Search for jobs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Wishlist */}
            <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-all">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Notifications */}
            <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 relative transition-all">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            </button>

            {/* Avatar */}
            <ProfileDropdown
              avatarUrl={"https://i.pravatar.cc/40?img=12"}
              onProfile={() => navigate("/profile")}
              onLogout={logoutUser}
            />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full transition-all"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <>
                    <line x1={18} y1={6} x2={6} y2={18} />
                    <line x1={6} y1={6} x2={18} y2={18} />
                  </>
                ) : (
                  <>
                    <line x1={3} y1={6} x2={21} y2={6} />
                    <line x1={3} y1={12} x2={21} y2={12} />
                    <line x1={3} y1={18} x2={21} y2={18} />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
            {["Home", "Jobs", "Applied Jobs", "Messages"].map((item) => (
              <a
                key={item}
                href="#"
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  item === "Home"
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Profile Banner ──────────────────────────────────────────────────── */}
      {!dismissed && (
        <div className="w-full bg-gradient-to-r from-orange-500 to-red-500 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white font-medium min-w-0">
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx={12} cy={12} r={10} />
              <line x1={12} y1={8} x2={12} y2={12} />
              <line x1={12} y1={16} x2={12.01} y2={16} />
            </svg>
            <span className="truncate">
              Complete your profile for better recommendations — 60% done!
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="bg-white text-orange-600 text-xs font-bold px-3 sm:px-4 py-1.5 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap">
              Complete Profile
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {/* ── Page Body ───────────────────────────────────────────────────────── */}
      <div className="w-full px-4 sm:px-6 py-5 flex gap-5">
        {/* Left Sidebar — hidden on mobile/tablet */}
        <aside className="hidden lg:flex flex-col gap-4 w-52 shrink-0">
          <SidebarContent
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
        </aside>

        {/* ── Center ────────────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Mobile search + filter row */}
          <div className="flex gap-2 md:hidden">
            <div className="relative flex-1">
              <span className="absolute left-3 top-3 text-slate-400">
                <SearchIcon />
              </span>
              <input
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-slate-400"
                placeholder="Search jobs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-orange-300 transition-colors"
            >
              <FilterIcon />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Tabs + job list card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`flex-shrink-0 px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap ${
                    activeTab === i
                      ? "text-orange-500"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                  <span className="ml-1 sm:ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {jobs.filter((j) => j.type === tabKeys[i]).length}
                  </span>
                  {activeTab === i && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Job cards */}
            <div className="p-2 sm:p-3 space-y-1">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <svg
                    className="h-10 w-10 mx-auto mb-3 opacity-30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <circle cx={11} cy={11} r={8} />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <p className="text-sm font-medium">No jobs found</p>
                </div>
              ) : (
                filtered.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </div>
        </main>

        {/* ── Right Sidebar — hidden below xl ───────────────────────────────── */}
        <aside className="hidden xl:flex flex-col gap-4 w-60 shrink-0">
          {/* Featured role */}
          {featuredJob && (
            <div
              className={`bg-gradient-to-br ${
                brandGradients[featuredJob.company] ??
                "from-slate-500 to-slate-700"
              } rounded-2xl p-5 text-white shadow-lg`}
            >
              <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-3">
                Featured Role
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-sm font-bold mb-3">
                {featuredJob.company.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-base leading-tight">
                {featuredJob.title}
              </h3>
              <p className="text-sm opacity-80 mt-0.5">{featuredJob.company}</p>
              <div className="flex items-center gap-1 text-xs opacity-70 mt-2">
                <LocationIcon />
                {featuredJob.location}
              </div>
              <div className="text-sm font-bold mt-1">{featuredJob.salary}</div>
              <button className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-xl transition-all border border-white/20">
                Apply Now
              </button>
            </div>
          )}

          {/* Market stats */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Job Market
            </h3>
            <div className="space-y-3">
              {marketStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-slate-500">{stat.label}</span>
                  <span className={`text-sm font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-orange-700 uppercase tracking-widest mb-2">
              Quick Tips
            </h3>
            <ul className="space-y-2">
              {quickTips.map((tip) => (
                <li
                  key={tip}
                  className="flex items-center gap-2 text-sm text-orange-700"
                >
                  <CheckIcon />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────────────────────────── */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-50 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-50 px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">Filters</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-all"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-5">
              <SidebarContent
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
              />
              <button
                onClick={() => setDrawerOpen(false)}
                className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
      <ConfirmModal
        open={showLogoutModal}
        message="Do you want to logout"
        title="Logout"
        onConfirm={handleLogout}
        onCancel={cancelModal}
      />
    </div>
  );
}
