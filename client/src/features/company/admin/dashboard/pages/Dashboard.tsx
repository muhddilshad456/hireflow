import type { ReactNode } from "react";
import { Ico } from "../../../../../assets/icons/CompanyIcons";

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

export function Dashboard() {
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
