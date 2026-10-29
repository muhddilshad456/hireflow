interface ApplicationsStatusChartProps {
  data: { status: string; count: number }[];
}

// Label and bar colour per application status; unknown statuses get a grey fallback
const STATUS_STYLE: Record<string, { label: string; bar: string }> = {
  IN_PROGRESS: { label: "In progress", bar: "bg-blue-500" },
  SELECTED: { label: "Selected", bar: "bg-emerald-500" },
  OFFER_SENT: { label: "Offer sent", bar: "bg-amber-500" },
  ACCEPTED: { label: "Accepted", bar: "bg-teal-500" },
  DECLINED: { label: "Declined", bar: "bg-orange-400" },
  REJECTED: { label: "Rejected", bar: "bg-red-500" },
  WITHDRAWN: { label: "Withdrawn", bar: "bg-slate-400" },
};

const styleFor = (status: string) =>
  STATUS_STYLE[status] ?? {
    label: status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase()),
    bar: "bg-gray-400",
  };

// No chart library needed: each bar is a div whose width is its share of the largest count
export function ApplicationsStatusChart({
  data,
}: ApplicationsStatusChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);

  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        No applications yet.
      </p>
    );
  }

  // Biggest first
  const rows = [...data].sort((a, b) => b.count - a.count);

  return (
    <ul className="space-y-3">
      {rows.map((d) => {
        const { label, bar } = styleFor(d.status);
        const percent = Math.round((d.count / total) * 100);
        return (
          <li key={d.status}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700">{label}</span>
              <span className="text-gray-500">
                {d.count} <span className="text-gray-400">({percent}%)</span>
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
              role="img"
              aria-label={`${label}: ${d.count} of ${total} applications`}
            >
              <div
                className={`h-full rounded-full ${bar}`}
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
