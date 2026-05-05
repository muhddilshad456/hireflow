type ActivityStatus = "Pending" | "Active" | "Approved" | "Closed";

interface ActivityItem {
  id: string;
  activity: string;
  timestamp: string;
  status: ActivityStatus;
}
interface StatItem {
  label: string;
  value: number;
  change: number;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const STATS: StatItem[] = [
  { label: "Total Users", value: 7265, change: 11.01 },
  { label: "Total Recruiters", value: 156, change: 15.03 },
  { label: "Total Jobs", value: 3671, change: -0.03 },
  { label: "Total Applications", value: 2318, change: 6.08 },
];

const ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    activity: "Company Registration – Tech Innovators Inc.",
    timestamp: "2023-11-15 10:30 AM",
    status: "Pending",
  },
  {
    id: "2",
    activity: "Job Posting – Senior Software Engineer",
    timestamp: "2023-11-14 03:45 PM",
    status: "Active",
  },
  {
    id: "3",
    activity: "Company Registration – Creative Solutions Ltd.",
    timestamp: "2023-11-13 09:15 AM",
    status: "Approved",
  },
  {
    id: "4",
    activity: "Job Posting – Marketing Manager",
    timestamp: "2023-11-12 01:20 PM",
    status: "Closed",
  },
  {
    id: "5",
    activity: "Company Registration – Global Enterprises",
    timestamp: "2023-11-11 11:55 AM",
    status: "Approved",
  },
];

const ACTIVITY_STATUS_STYLE: Record<ActivityStatus, string> = {
  Pending: "bg-yellow-400 text-yellow-900",
  Active: "bg-green-500 text-white",
  Approved: "bg-emerald-500 text-white",
  Closed: "bg-cyan-500 text-white",
};

const IcoTrendUp = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IcoTrendDown = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

function StatCard({ label, value, change }: StatItem) {
  const pos = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 lg:px-5 py-4 hover:shadow-md transition-shadow">
      <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 leading-tight">
        {label}
      </p>
      <div className="flex items-end justify-between gap-2">
        <span className="text-xl sm:text-2xl lg:text-[28px] font-bold text-gray-800 leading-none tracking-tight">
          {value.toLocaleString()}
        </span>
        <span
          className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-1 rounded-full shrink-0 ${pos ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
        >
          {pos ? <IcoTrendUp /> : <IcoTrendDown />}
          {pos ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function ActivityTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-gray-50">
        <h3 className="text-[13px] font-semibold text-gray-600">
          Recent Activity
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[480px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {["Activity", "Timestamp", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 md:px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACTIVITIES.map((item, i) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 transition-colors ${i < ACTIVITIES.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <td className="px-4 md:px-6 py-4 text-gray-700 font-medium">
                  {item.activity}
                </td>
                <td className="px-4 md:px-6 py-4 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                  {item.timestamp}
                </td>
                <td className="px-4 md:px-6 py-4">
                  <span
                    className={`inline-flex items-center justify-center px-4 py-1.5 rounded-md text-[11px] font-semibold min-w-[80px] ${ACTIVITY_STATUS_STYLE[item.status]}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Welcome back! Here's what's happening today.
        </p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      <ActivityTable />
    </div>
  );
}
