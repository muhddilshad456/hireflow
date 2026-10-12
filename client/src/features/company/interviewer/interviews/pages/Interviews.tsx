import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  InterviewListItem,
  InterviewStatus,
} from "../../../../../types/interview/interview";
import { getMyInterviews } from "../services/interviewServices";

const LIMIT = 8;
const DEBOUNCE_MS = 400;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "SCHEDULED", label: "Upcoming" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function formatStageName(name: string) {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatusBadge({ status }: { status: InterviewStatus }) {
  const config: Record<InterviewStatus, { label: string; classes: string }> = {
    SCHEDULED: { label: "Upcoming", classes: "bg-blue-50 text-blue-600" },
    COMPLETED: {
      label: "Completed",
      classes: "bg-emerald-50 text-emerald-600",
    },
    CANCELLED: { label: "Cancelled", classes: "bg-red-50 text-red-500" },
  };
  const { label, classes } = config[status];
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

export function InterviewsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const getInterviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyInterviews({
        search: debouncedSearch || undefined,
        status: status || undefined,
        page,
        limit: LIMIT,
      });
      setInterviews(result.requests);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      console.log(error?.response);
      setError(error?.response?.data?.message || "Failed to load interviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInterviews();
  }, [debouncedSearch, status, page]);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-slate-900">Interviews</h1>

      {/* Search + status filter */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate or job title..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 sm:w-48"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Status: {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        {loading && (
          <p className="py-10 text-center text-sm text-slate-400">
            Loading interviews...
          </p>
        )}

        {!loading && error && (
          <p className="py-10 text-center text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && interviews.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            No interviews found.
          </p>
        )}

        {!loading && !error && interviews.length > 0 && (
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Candidate Name</th>
                <th className="px-5 py-3">Job Title</th>
                <th className="px-5 py-3">Interview Stage</th>
                <th className="px-5 py-3">Date &amp; Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((iv) => (
                <tr
                  key={iv._id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-600">
                        {initials(iv.candidate.name)}
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {iv.candidate.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {iv.job.title}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatStageName(iv.jobStage.name)}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    <div>{formatDate(iv.scheduledAt)}</div>
                    <div className="text-slate-400">
                      {formatTime(iv.scheduledAt)}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={iv.status} />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() =>
                        navigate(`/company/interviewer/interviews/${iv._id}`)
                      }
                      className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          >
            {"<"}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                p === page
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          >
            {">"}
          </button>
        </div>
      )}
    </div>
  );
}
