import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Clock, FileText, UserCheck } from "lucide-react";
import type { RecruiterDashboardData } from "../../../../../types/company/recruiter/recruiter";
import { getRecruiterDashboard } from "../services/Dashboardservices";
import {
  StatCard,
  StatCardSkeleton,
} from "../../../../shared/components/StatCard";
import { ApplicationsStatusChart } from "../../../../shared/components/Applicationsstatuschart";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const JOB_STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-emerald-50 text-emerald-600",
  FILLED: "bg-blue-50 text-blue-600",
  CLOSED: "bg-gray-100 text-gray-500",
};

export function RecruiterDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<RecruiterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecruiterDashboard();
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Try again
        </button>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        A quick look at your jobs and applicants.
      </p>

      {/* ---------- stat cards ---------- */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Open jobs"
              value={stats.openJobs}
              icon={<Briefcase size={18} />}
            />
            <StatCard
              label="Total applicants"
              value={stats.totalApplicants}
              icon={<FileText size={18} />}
            />
            <StatCard
              label="In progress"
              value={stats.inProgress}
              icon={<Clock size={18} />}
            />
            <StatCard
              label="Selected"
              value={stats.selected}
              icon={<UserCheck size={18} />}
            />
          </>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* ---------- chart ---------- */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">
            Applications by status
          </h2>
          <div className="mt-4">
            {loading || !data ? (
              <div className="space-y-4 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    <div className="mb-2 h-3 w-24 rounded bg-gray-200" />
                    <div className="h-2.5 w-full rounded-full bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : (
              <ApplicationsStatusChart data={data.applicationsByStatus} />
            )}
          </div>
        </section>

        {/* ---------- my latest jobs ---------- */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">My latest jobs</h2>
          <div className="mt-4">
            {loading || !data ? (
              <div className="space-y-3 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : data.latestJobs.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                You haven't posted any jobs yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.latestJobs.map((job) => (
                  <li key={job._id}>
                    {/* Opens the job's hiring flow (the layout redirects "first" to the first stage) */}
                    <button
                      onClick={() =>
                        navigate(
                          `/company/recruiter/job/${job._id}/stage/first`,
                        )
                      }
                      className="flex w-full items-center justify-between gap-3 rounded-lg py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-gray-900">
                          {job.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-400">
                          {job.applicantsCount} applicant
                          {job.applicantsCount === 1 ? "" : "s"} ·{" "}
                          {formatDate(job.createdAt)}
                        </span>
                      </span>
                      <span
                        className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          JOB_STATUS_STYLE[job.status] ??
                          "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {job.status.charAt(0) +
                          job.status.slice(1).toLowerCase()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
