export interface BarItem {
  label: string;
  count: number;
  barClass: string; // Tailwind background colour, e.g. "bg-blue-500"
}

interface SimpleBarChartProps {
  items: BarItem[];
  emptyText?: string;
}

// Generic version of the status chart: the caller supplies labels and colours.
// No chart library needed: each bar is a div whose width is its share of the largest count.
export function SimpleBarChart({
  items,
  emptyText = "Nothing to show yet.",
}: SimpleBarChartProps) {
  const total = items.reduce((sum, i) => sum + i.count, 0);
  const max = Math.max(...items.map((i) => i.count), 1);

  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">{emptyText}</p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const percent = Math.round((item.count / total) * 100);
        return (
          <li key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-gray-500">
                {item.count} <span className="text-gray-400">({percent}%)</span>
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
              role="img"
              aria-label={`${item.label}: ${item.count} of ${total}`}
            >
              <div
                className={`h-full rounded-full ${item.barClass}`}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
