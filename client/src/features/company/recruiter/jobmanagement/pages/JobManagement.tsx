import { useEffect, useState } from "react";
import CreateJobModal from "../components/jobCreateModal";
import type { JobFormData } from "../../../../../types/job/job/jobForm";
import toast from "react-hot-toast";
import { createJobApi } from "../services/jobServices";
import { getJobsApi } from "../../../../shared/services/jobService";
import { useNavigate } from "react-router-dom";

// ── Types ────────────────────────────────────────────────────────────────────
type JobStatus = "OPEN" | "CLOSED" | "FILLED";
type JobCategory = "IT" | "MARKETING" | "FINANCE" | "HR" | "SALES" | "OTHER";

interface Job {
  _id: string;
  title: string;
  status: JobStatus;
  postedLabel: string;
  category: JobCategory;
  location: string;
  phase: string;
  totalApplied: number;
  activeCandidates: number;
  hiredCount: number;
  icon: "design" | "engineering" | "recruiter";
}

// ── Icon Components ───────────────────────────────────────────────────────────
const DesignIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-indigo-400">
    <rect
      x="8"
      y="8"
      width="32"
      height="32"
      rx="6"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M16 32 L24 16 L32 32"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 26 h10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const EngineeringIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-indigo-400">
    <path
      d="M14 17 L20 24 L14 31"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 31 h12"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const RecruiterIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-amber-400">
    <rect
      x="10"
      y="14"
      width="28"
      height="20"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M16 22 h16M16 28 h10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="34" cy="30" r="1.5" fill="currentColor" />
  </svg>
);

const iconMap = {
  design: DesignIcon,
  engineering: EngineeringIcon,
  recruiter: RecruiterIcon,
};

const iconBg: Record<Job["icon"], string> = {
  design: "bg-indigo-50",
  engineering: "bg-indigo-50",
  recruiter: "bg-amber-50",
};

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps {
  status: JobStatus;
}

const Badge = ({ status }: BadgeProps) => {
  const styles: Record<JobStatus, string> = {
    OPEN: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    FILLED: "bg-amber-100 text-amber-700 border border-amber-200",
    CLOSED: "bg-slate-100 text-slate-500 border border-slate-200",
  };
  return (
    <span
      className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  highlight?: boolean;
}

const StatCard = ({ label, value, highlight = false }: StatCardProps) => (
  <div className="bg-slate-50 rounded-xl p-4 flex-1 min-w-0">
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p
      className={`text-2xl font-bold ${highlight ? "text-emerald-500" : "text-slate-800"}`}
    >
      {value}
    </p>
  </div>
);

// ── Phase Label ───────────────────────────────────────────────────────────────
interface PhaseLabelProps {
  phase: string;
  status: JobStatus;
}

const PhaseLabel = ({ phase, status }: PhaseLabelProps) => {
  const color = status === "FILLED" ? "text-amber-500" : "text-emerald-500";
  return <span className={`text-sm font-medium ${color}`}>{phase}</span>;
};

// ── Job Card ──────────────────────────────────────────────────────────────────
interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const IconComp = iconMap[job.icon] || EngineeringIcon;
  const navigate = useNavigate();

  const handleViewJob = () => {
    navigate(`/company/recruiter/job/${job._id}`);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-5 pb-4">
        <div className="flex-1 min-w-0">
          {/* Status + timestamp */}
          <div className="flex items-center gap-2 mb-2">
            <Badge status={job.status} />
            <span className="text-xs text-slate-400">{job.postedLabel}</span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-slate-800 mb-2 leading-snug">
            {job.title}
          </h2>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 16 16"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="2" y="3" width="12" height="10" rx="2" />
                <path d="M5 7h6M5 10h4" strokeLinecap="round" />
              </svg>
              {job.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 16 16"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M8 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5z" />
              </svg>
              {job.location}
            </span>
            <span className="text-slate-300">•</span>
            <PhaseLabel phase={job.phase} status={job.status} />
          </div>

          {/* CTA */}
          <button
            onClick={handleViewJob}
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all duration-150"
          >
            View Job
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 16 16"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Icon thumbnail */}
        <div
          className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl ${iconBg[job.icon]} flex items-center justify-center self-start`}
        >
          <IconComp />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 px-5 pb-5">
        <StatCard label="Total Applied" value={job.totalApplied} />
        <StatCard
          label="Active Candidates"
          value={job.activeCandidates}
          highlight
        />
        <StatCard label="Hired Count" value={job.hiredCount} />
      </div>
    </div>
  );
};

// ── Search & Filter Bar ───────────────────────────────────────────────────────
interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
  categoryFilter: string;
  onCategoryFilter: (v: string) => void;
  handleOpenAddJobModal: () => void;
}

const FilterBar = ({
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  categoryFilter,
  onCategoryFilter,
  handleOpenAddJobModal,
}: FilterBarProps) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6">
    {/* Search */}
    <div className="relative flex-1">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none"
        viewBox="0 0 16 16"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="6.5" cy="6.5" r="4.5" />
        <path d="M10 10 l3 3" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder="by job title, category, or location"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
      />
    </div>

    {/* Status dropdown */}
    <select
      value={statusFilter}
      onChange={(e) => onStatusFilter(e.target.value)}
      className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
    >
      <option value="">Job Status</option>
      <option value="OPEN">OPEN</option>
      <option value="CLOSED">CLOSED</option>
      <option value="FILLED">FILLED</option>
    </select>

    {/* Category dropdown */}
    <select
      value={categoryFilter}
      onChange={(e) => onCategoryFilter(e.target.value)}
      className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
    >
      <option value="">Job Category</option>
      <option value="IT">IT</option>
      <option value="MARKETING">MARKETING</option>
      <option value="FINANCE">FINANCE</option>
      <option value="HR">HR</option>
      <option value="SALES">SALES</option>
      <option value="OTHER">OTHER</option>
    </select>

    {/* Add button */}
    <button
      onClick={handleOpenAddJobModal}
      className="shrink-0 w-10 h-10 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full flex items-center justify-center transition-all shadow-sm"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 16 16"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M8 3v10M3 8h10" strokeLinecap="round" />
      </svg>
    </button>
  </div>
);

// ── Pagination ────────────────────────────────────────────────────────────────
interface PaginationProps {
  current: number;
  total: number;
  onChange: (p: number) => void;
}

const Pagination = ({ current, total, onChange }: PaginationProps) => {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 16 16"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M10 4 L6 8 L10 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-semibold transition ${
            current === p
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 16 16"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M6 4 L10 8 L6 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [jobModalOpen, setJobModalOpen] = useState(false);

  const handleCreateJob = async (jobFormData: JobFormData) => {
    try {
      const result = await createJobApi(jobFormData);
      console.log("result of job creation : ", result);
      toast.success("Job created");
      setJobModalOpen(false);
      return true;
    } catch (error: any) {
      console.log(error?.response?.data);
      toast.error(error?.response?.data?.message);
      return false;
    }
  };

  const getJobs = async () => {
    try {
      const result = await getJobsApi({
        search,
        status: statusFilter,
        category: categoryFilter ? [categoryFilter] : [],
        page: currentPage,
        limit: 2,
      });
      console.log(result);
      setJobs(result.data.data);
      setTotalPages(result.data.totalPages);
    } catch (error: any) {
      console.log(error?.response?.data);
    }
  };

  const openJobModal = () => setJobModalOpen(true);
  const closeJobModal = () => setJobModalOpen(false);

  useEffect(() => {
    setCurrentPage(1);
    getJobs();
  }, [categoryFilter, statusFilter, search]);

  useEffect(() => {
    getJobs();
  }, [currentPage]);

  return (
    <>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); * { font-family: 'DM Sans', sans-serif; }`}</style>

      {/* Main content */}
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Jobs Posted</h1>
        <p className="text-sm text-slate-500">
          Manage your active listings and track candidate progress.
        </p>
      </div>

      {/* Filter bar */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilter={setCategoryFilter}
        handleOpenAddJobModal={openJobModal}
      />

      {/* Job list */}
      <div className="space-y-4">
        {jobs?.length > 0 ? (
          jobs.map((job) => <JobCard key={job._id} job={job} />)
        ) : (
          <div className="text-center py-16 text-slate-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-30"
              fill="none"
              viewBox="0 0 48 48"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="24" cy="24" r="20" />
              <path d="M16 24h16M24 16v16" strokeLinecap="round" />
            </svg>
            <p className="text-sm font-medium">No jobs match your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {jobs?.length > 0 && (
        <Pagination
          current={currentPage}
          total={totalPages}
          onChange={setCurrentPage}
        />
      )}
      {jobModalOpen && (
        <CreateJobModal onClose={closeJobModal} onSubmit={handleCreateJob} />
      )}
    </>
  );
}
