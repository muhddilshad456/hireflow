import type { ApplicationStatus } from "../../../../../types/applicaionTypes";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

const statusStyles: Record<ApplicationStatus, string> = {
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  SELECTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  WITHDRAWN: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusLabels: Record<ApplicationStatus, string> = {
  IN_PROGRESS: "In Progress",
  SELECTED: "Selected",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export function ApplicationStatusBadge({
  status,
}: ApplicationStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[status]}`}
    >
      Application: {statusLabels[status]}
    </span>
  );
}
