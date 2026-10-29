import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
}

// Shared by all four dashboards (company admin, recruiter, interviewer, platform admin)
export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none text-gray-900">{value}</p>
        <p className="mt-1 truncate text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
      <div className="h-10 w-10 rounded-xl bg-gray-200" />
      <div className="flex-1">
        <div className="mb-2 h-5 w-12 rounded bg-gray-200" />
        <div className="h-3 w-24 rounded bg-gray-200" />
      </div>
    </div>
  );
}
