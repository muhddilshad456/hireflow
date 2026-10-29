import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { AdminDashboardData } from "../../../../types/admin/admin";
import {
  StatCard,
  StatCardSkeleton,
} from "../../../shared/components/StatCard";
import { SimpleBarChart } from "../../../company/interviewer/dashboard/components/Simplebarchart";
import { getAdminDashboard } from "../../services/adminServices";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboard();
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
        An overview of the whole platform.
      </p>

      {/* ---------- stat cards ---------- */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {loading || !stats ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Companies"
              value={stats.totalCompanies}
              icon={<Building2 size={18} />}
            />
            <StatCard
              label="Pending verifications"
              value={stats.pendingVerifications}
              icon={<ShieldCheck size={18} />}
            />
            <StatCard
              label="Candidates"
              value={stats.candidates}
              icon={<Users size={18} />}
            />
            <StatCard
              label="Jobs posted"
              value={stats.totalJobs}
              icon={<Briefcase size={18} />}
            />
            <StatCard
              label="Active subscriptions"
              value={stats.activeSubscriptions}
              icon={<Sparkles size={18} />}
            />
          </>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* ---------- chart ---------- */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">
            Companies by status
          </h2>
          <div className="mt-4">
            {loading || !stats ? (
              <div className="space-y-4 animate-pulse">
                {[0, 1].map((i) => (
                  <div key={i}>
                    <div className="mb-2 h-3 w-24 rounded bg-gray-200" />
                    <div className="h-2.5 w-full rounded-full bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : (
              <SimpleBarChart
                emptyText="No companies yet."
                items={[
                  {
                    label: "Active",
                    count: stats.activeCompanies,
                    barClass: "bg-emerald-500",
                  },
                  {
                    label: "Inactive",
                    count: stats.inactiveCompanies,
                    barClass: "bg-slate-400",
                  },
                ]}
              />
            )}
          </div>
        </section>

        {/* ---------- pending verification requests ---------- */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Pending verification requests
            </h2>
            <button
              onClick={() => navigate("/admin/companies-verify-requests")}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>

          <div className="mt-4">
            {loading || !data ? (
              <div className="space-y-3 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : data.pendingVerificationRequests.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No pending requests. You're all caught up.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.pendingVerificationRequests.map((r) => (
                  <li
                    key={r._id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-gray-900">
                        {r.companyName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {r.email}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Requested {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        r.verificationType === "NEW"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {r.verificationType === "NEW"
                        ? "New company"
                        : "Profile update"}
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
