import { useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, Briefcase, Heart, MapPin } from "lucide-react";
import type { ApplicationStatus } from "../../../../types/applicaionTypes";

export interface WishlistJob {
  _id: string;
  title: string;
  location?: string;
  jobType?: string;
  application?: {
    _id: string;
    status: ApplicationStatus;
    appliedAt: string;
  };
}

interface WishlistJobCardProps {
  job: WishlistJob;
  onRemove: (job: WishlistJob) => void;
}

const formatJobType = (value?: string) =>
  value
    ? value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    : "";

const jobTypeDot = (value?: string) => {
  switch (value) {
    case "FULL_TIME":
      return "bg-[#F4522A]";
    case "PART_TIME":
      return "bg-blue-500";
    case "INTERNSHIP":
      return "bg-purple-500";
    case "CONTRACT":
      return "bg-amber-500";
    default:
      return "bg-gray-400";
  }
};

// band = full-width strip on top of the card, badge = status pill inside it
const applicationStatusStyle: Record<
  ApplicationStatus,
  { label: string; band: string; badge: string }
> = {
  IN_PROGRESS: {
    label: "In Progress",
    band: "bg-amber-50 border-amber-100 text-amber-700",
    badge: "bg-white text-amber-600 ring-amber-200",
  },
  REJECTED: {
    label: "Rejected",
    band: "bg-red-50 border-red-100 text-red-700",
    badge: "bg-white text-red-600 ring-red-200",
  },
  SELECTED: {
    label: "Selected",
    band: "bg-green-50 border-green-100 text-green-700",
    badge: "bg-white text-green-600 ring-green-200",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    band: "bg-gray-100 border-gray-200 text-gray-600",
    badge: "bg-white text-gray-600 ring-gray-300",
  },
};

export function WishlistJobCard({ job, onRemove }: WishlistJobCardProps) {
  const navigate = useNavigate();

  const application = job.application;
  const statusStyle = application
    ? applicationStatusStyle[application.status]
    : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md hover:shadow-orange-100/70">
      {/* Application strip (only when the user has applied) */}
      {application && statusStyle && (
        <div
          className={`flex items-center justify-between gap-3 border-b px-5 py-2.5 ${statusStyle.band}`}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
            <BadgeCheck size={15} />
            Applied
          </span>
          <span className="flex items-center gap-2 text-xs">
            <span className="font-medium opacity-80">Application Status</span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-semibold ring-1 ${statusStyle.badge}`}
            >
              {statusStyle.label}
            </span>
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex gap-4 px-5 py-5">
        <div className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#F4522A] ring-4 ring-orange-50/60 sm:flex">
          <Briefcase size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug text-gray-900 sm:text-lg">
            {job.title}
          </h3>

          <ul className="mt-3 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
            {job.location && (
              <li className="flex items-center gap-1.5">
                <MapPin size={14} className="flex-shrink-0 text-[#F4522A]" />
                <span>{job.location}</span>
              </li>
            )}
            {job.jobType && (
              <li className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 flex-shrink-0 rounded-full ${jobTypeDot(job.jobType)}`}
                />
                <span>{formatJobType(job.jobType)}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3 border-t border-dashed border-gray-200 bg-gray-50/70 px-5 py-3">
        <button
          type="button"
          onClick={() => onRemove(job)}
          aria-label={`Remove ${job.title} from wishlist`}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <Heart size={15} fill="currentColor" />
          Remove
        </button>

        <button
          onClick={() => navigate("/job", { state: { jobId: job._id } })}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#F4522A] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition-colors hover:bg-[#e04420] active:bg-[#c93b1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4522A] focus-visible:ring-offset-2"
        >
          View Details
          <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}
