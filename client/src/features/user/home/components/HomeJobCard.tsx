import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, MapPin, Wallet } from "lucide-react";
import type { Job } from "../../../../types/jobTypes";

interface HomeJobCardProps {
  job: Partial<Job>;
}

// "FULL_TIME" -> "Full time"
const formatJobType = (value?: string) =>
  value
    ? value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    : "";

// Colour per job type; anything unknown falls back to grey
const jobTypeStyle = (value?: string) => {
  switch (value) {
    case "FULL_TIME":
      return "bg-orange-50 text-[#F4522A] ring-orange-100";
    case "PART_TIME":
      return "bg-blue-50 text-blue-600 ring-blue-100";
    case "INTERNSHIP":
      return "bg-purple-50 text-purple-600 ring-purple-100";
    case "CONTRACT":
      return "bg-amber-50 text-amber-600 ring-amber-100";
    default:
      return "bg-gray-100 text-gray-600 ring-gray-200";
  }
};

export function HomeJobCard({ job }: HomeJobCardProps) {
  const navigate = useNavigate();
  const companyName = job.company?.companyName;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/60">
      {/* accent bar that appears on hover */}
      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#F4522A] to-orange-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      {/* top: avatar + title + company */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 text-lg font-bold text-[#F4522A] ring-1 ring-orange-100">
          {(companyName?.charAt(0) ?? "?").toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-[#F4522A]">
            {job.title}
          </h3>
          {companyName && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
              <Building2 size={13} className="flex-shrink-0 text-gray-400" />
              <span className="truncate">{companyName}</span>
            </p>
          )}
        </div>
      </div>

      {/* bottom: details + action */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {job.location && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-100">
              <MapPin size={12} className="text-[#F4522A]" />
              {job.location}
            </span>
          )}
          {job.salary && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-100">
              <Wallet size={12} className="text-[#F4522A]" />
              {job.salary}
            </span>
          )}
          {job.jobType && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${jobTypeStyle(job.jobType)}`}
            >
              {formatJobType(job.jobType)}
            </span>
          )}
        </div>

        <button
          onClick={() => navigate("/job", { state: { jobId: job._id } })}
          className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#F4522A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition-colors hover:bg-[#e04420] active:bg-[#c93b1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4522A] focus-visible:ring-offset-2"
        >
          View Details
          <ArrowRight
            size={15}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </article>
  );
}
