import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getJobsApi,
  updateJobActiveStatusApi,
} from "../../../../shared/services/jobService";

/* ═══════════════════════════ TYPES ═══════════════════════════ */
// Values match what the backend repository checks for `isActive`
type FilterValue = "all" | "Active" | "Blocked";

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  experienceMin?: number;
  experienceMax?: number;
  status: "OPEN" | "CLOSED" | "FILLED";
  applicationDeadline?: string;
  positions: number;
  applicantsCount: number;
  isActive: boolean;
  createdBy?: { _id: string; name: string } | null;
}

/* ═══════════════════════════ CONFIG ═══════════════════════════ */
const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 500;

const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Unblocked", value: "Active" },
  { label: "Blocked", value: "Blocked" },
];

/* ═══════════════════════════ HELPERS ═══════════════════════════ */
const formatEnum = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const formatRange = (min?: number, max?: number, suffix = "") => {
  if (min == null && max == null) return "—";
  if (min != null && max != null)
    return `${min.toLocaleString()} - ${max.toLocaleString()}${suffix}`;
  return `${(min ?? max)!.toLocaleString()}${suffix}`;
};

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

/* ═══════════════════════════ VIEW DETAILS MODAL ═══════════════════════════ */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-xs font-semibold text-slate-400 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-700 text-right break-words">
        {value}
      </span>
    </div>
  );
}

function ViewJobModal({ job, onClose }: { job: Job; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-800">Job Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-3">
          <p className="font-bold text-slate-800 text-base">{job.title}</p>
          <span
            className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold border ${
              job.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                job.isActive ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            {job.isActive ? "Unblocked" : "Blocked"}
          </span>
        </div>

        <div className="divide-y" style={{ borderColor: "#f0f0eb" }}>
          <DetailRow label="Recruiter" value={job.createdBy?.name ?? "—"} />
          <DetailRow label="Category" value={formatEnum(job.category)} />
          <DetailRow label="Location" value={job.location || "—"} />
          <DetailRow label="Job Type" value={formatEnum(job.jobType)} />
          <DetailRow
            label="Salary"
            value={formatRange(job.salaryMin, job.salaryMax)}
          />
          <DetailRow
            label="Experience"
            value={formatRange(job.experienceMin, job.experienceMax, " yrs")}
          />
          <DetailRow label="Positions" value={String(job.positions)} />
          <DetailRow label="Applicants" value={String(job.applicantsCount)} />
          <DetailRow label="Job Status" value={formatEnum(job.status)} />
          <DetailRow
            label="Application Deadline"
            value={formatDate(job.applicationDeadline)}
          />
        </div>

        {job.skills?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-400 mb-1.5">
            Description
          </p>
          <p className="text-sm text-slate-600 whitespace-pre-line break-words">
            {job.description || "—"}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 border border-slate-200 text-slate-600 text-sm font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════ PAGINATION ═══════════════════════════ */
function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const pages: (number | "...")[] = [];

  if (total <= 6) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3);
    if (current > 4) pages.push("...");
    if (current > 3 && current < total - 1) pages.push(current);
    pages.push("...", total);
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`dot-${i}`}
            className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
              current === p
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════ MAIN PAGE ═══════════════════════════ */
export function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<FilterValue>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [confirmJob, setConfirmJob] = useState<Job | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  /* ── Debounce search ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  /* ── Fetch jobs ── */
  useEffect(() => {
    let ignore = false;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        // `status` is read by the backend as the isActive filter ("Active" | "Blocked").
        // Cast is only needed if your JobFilters type doesn't list these keys.
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearch || undefined,
          status: filterStatus === "all" ? undefined : filterStatus,
        };
        const res = await getJobsApi(params as any);

        if (ignore) return;

        setJobs(res?.data?.data ?? []);
        setTotalPages(res?.data?.totalPages ?? 0);
      } catch (error: any) {
        if (ignore) return;
        toast.error(error?.response?.data?.message || "Failed to fetch jobs.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchJobs();

    // Ignore stale responses when params change quickly
    return () => {
      ignore = true;
    };
  }, [currentPage, debouncedSearch, filterStatus, refreshKey]);

  /* ── If the current page no longer exists, step back ── */
  useEffect(() => {
    if (!loading && totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [loading, totalPages, currentPage]);

  const refetch = () => setRefreshKey((k) => k + 1);

  const handleToggleBlock = async () => {
    if (!confirmJob) return;

    const newStatus = confirmJob.isActive ? "BLOCKED" : "ACTIVE";

    setIsUpdating(true);
    try {
      await updateJobActiveStatusApi(confirmJob._id, newStatus);
      toast.success(
        confirmJob.isActive
          ? "Job blocked successfully."
          : "Job unblocked successfully.",
      );
      setConfirmJob(null);
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update job status.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFilterChange = (val: FilterValue) => {
    setFilterStatus(val);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  const currentFilterLabel =
    FILTER_OPTIONS.find((o) => o.value === filterStatus)?.label ?? "All";

  return (
    <>
      {/* View details modal */}
      {viewingJob && (
        <ViewJobModal job={viewingJob} onClose={() => setViewingJob(null)} />
      )}

      {/* Block / Unblock confirm modal */}
      {confirmJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => !isUpdating && setConfirmJob(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-black text-slate-800 mb-2">
              {confirmJob.isActive ? "Block Job?" : "Unblock Job?"}
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              {confirmJob.isActive
                ? "This will block the job "
                : "This will unblock the job "}
              <span className="font-semibold text-slate-700">
                {confirmJob.title}
              </span>
              .
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmJob(null)}
                disabled={isUpdating}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleBlock}
                disabled={isUpdating}
                className={`flex-1 text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 ${
                  confirmJob.isActive
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {isUpdating
                  ? "Please wait..."
                  : confirmJob.isActive
                    ? "Block"
                    : "Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page ── */}
      <div className="space-y-5">
        {/* ── Title ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Jobs
          </h1>
        </div>

        {/* ── Table section ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #e8e8e4" }}
        >
          {/* Heading row + search + filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <h2 className="font-bold text-slate-800 text-[15px]">All Jobs</h2>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search job title"
                  className="w-56 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Filter pill */}
              <div className="relative">
                <button
                  onClick={() => setFilterOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-colors"
                  style={{ backgroundColor: "#e8e8e4", color: "#444" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ddddd8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e8e8e4")
                  }
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${filterOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {currentFilterLabel}
                </button>
                {filterOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-10 overflow-hidden min-w-[130px]">
                    {FILTER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleFilterChange(opt.value)}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                          filterStatus === opt.value
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[620px]">
              <thead>
                <tr
                  style={{
                    borderTop: "1px solid #e8e8e4",
                    borderBottom: "1px solid #e8e8e4",
                  }}
                >
                  {[
                    "Job Name",
                    "Recruiter Name",
                    "Status",
                    "Actions",
                    "View Details",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-semibold"
                      style={{ color: "#888884" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-slate-400 text-sm"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-slate-400 text-sm"
                    >
                      No jobs found.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job, idx) => (
                    <tr
                      key={job._id}
                      style={{
                        borderBottom:
                          idx < jobs.length - 1 ? "1px solid #f0f0eb" : "none",
                      }}
                    >
                      {/* Job name */}
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {job.title}
                      </td>
                      {/* Recruiter */}
                      <td className="px-6 py-4 text-slate-500">
                        {job.createdBy?.name ?? "—"}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold text-sm ${
                            job.isActive ? "text-emerald-600" : "text-rose-500"
                          }`}
                        >
                          {job.isActive ? "Unblocked" : "Blocked"}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setConfirmJob(job)}
                          className={`text-white text-xs font-bold px-5 py-2 rounded-full transition-colors ${
                            job.isActive
                              ? "bg-rose-400 hover:bg-rose-500"
                              : "bg-emerald-500 hover:bg-emerald-600"
                          }`}
                        >
                          {job.isActive ? "Block" : "Unblock"}
                        </button>
                      </td>
                      {/* View Details */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setViewingJob(job)}
                          className="text-sm font-semibold transition-colors"
                          style={{ color: "#6abf4b" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#58a83b")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#6abf4b")
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (always visible) */}
          <div className="px-6 py-4" style={{ borderTop: "1px solid #f0f0eb" }}>
            <Pagination
              current={currentPage}
              total={Math.max(totalPages, 1)}
              onChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
