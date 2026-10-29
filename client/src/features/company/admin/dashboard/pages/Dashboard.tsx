import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  ClipboardList,
  FileText,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import type { CompanyAdminDashboardData } from "../../../../../types/company/admin/admin";
import { getCompanyAdminDashboard } from "../services/comapanyServices";
import {
  StatCard,
  StatCardSkeleton,
} from "../../../../shared/components/StatCard";
import { ApplicationsStatusChart } from "../../../../shared/components/Applicationsstatuschart";

const PROFILE_ROUTE = "/company/admin/profile"; // where your Upgrade card lives

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

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<CompanyAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCompanyAdminDashboard();
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
  const subscription = data?.subscription;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        A quick look at your company's hiring.
      </p>

      {/* ---------- stat cards ---------- */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {loading || !stats ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Open jobs"
              value={stats.openJobs}
              icon={<Briefcase size={18} />}
            />
            <StatCard
              label="Total applications"
              value={stats.totalApplications}
              icon={<FileText size={18} />}
            />
            <StatCard
              label="Selected candidates"
              value={stats.selected}
              icon={<UserCheck size={18} />}
            />
            <StatCard
              label="Recruiters"
              value={stats.recruiters}
              icon={<Users size={18} />}
            />
            <StatCard
              label="Interviewers"
              value={stats.interviewers}
              icon={<ClipboardList size={18} />}
            />
          </>
        )}

        {/* subscription */}
        {loading || !subscription ? (
          <StatCardSkeleton />
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                subscription.isActive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">
                {subscription.isActive ? "Premium plan" : "Free plan"}
              </p>
              {subscription.isActive && subscription.endDate ? (
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {subscription.daysRemaining} days left ·{" "}
                  {formatDate(subscription.endDate)}
                </p>
              ) : (
                <button
                  onClick={() => navigate(PROFILE_ROUTE)}
                  className="mt-0.5 text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
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

        {/* ---------- latest jobs ---------- */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">Latest jobs</h2>
          <div className="mt-4">
            {loading || !data ? (
              <div className="space-y-3 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : data.latestJobs.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No jobs posted yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.latestJobs.map((job) => (
                  <li
                    key={job._id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-gray-900">
                        {job.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {job.applicantsCount} applicant
                        {job.applicantsCount === 1 ? "" : "s"} ·{" "}
                        {formatDate(job.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        JOB_STATUS_STYLE[job.status] ??
                        "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                    </span>
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
