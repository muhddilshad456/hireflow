import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getJobApi } from "../../../shared/services/jobService";

// ── Types ────────────────────────────────────────────────────────────────────
type JobType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
type JobStatus = "OPEN" | "CLOSED" | "FILLED";
type JobCategory = "IT" | "MARKETING" | "FINANCE" | "HR" | "SALES" | "OTHER";

interface IJob {
  _id: string;
  company: { _id: string; companyName: string; logo?: string };
  createdBy: { _id: string; name: string };
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  experienceMin?: number;
  experienceMax?: number;
  category: JobCategory;
  status: JobStatus;
  applicationDeadline?: string;
  positions: number;
  applicantsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
};

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  OPEN: {
    label: "Open",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  CLOSED: {
    label: "Closed",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  FILLED: {
    label: "Filled",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
};

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return "Not disclosed";
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} / yr`;
  if (min) return `From ${fmt(min)} / yr`;
  return `Up to ${fmt(max!)} / yr`;
}

function formatExperience(min?: number, max?: number) {
  if (!min && !max) return "Not specified";
  if (min && max) return `${min} – ${max} years`;
  if (min) return `${min}+ years`;
  return `Up to ${max} years`;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function daysUntilDeadline(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── Sub-components ───────────────────────────────────────────────────────────
function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[#e05c3a] uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="mt-8 mb-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="mt-2 h-px bg-gray-200" />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function JobDetailsPage() {
  const [jobDetails, setJobDetails] = useState<IJob | null>(null);

  const { id } = useParams();

  const status = jobDetails?.status
    ? STATUS_CONFIG[jobDetails.status]
    : STATUS_CONFIG.OPEN;

  const days = jobDetails?.applicationDeadline
    ? daysUntilDeadline(jobDetails.applicationDeadline)
    : null;

  const fetchJobDetails = async () => {
    if (!id) return;
    try {
      const result = await getJobApi(id);
      console.log("job details : ", result);
      setJobDetails(result.data);
    } catch (error: any) {
      console.log(error?.response?.message);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, []);

  return (
    <>
      {/* ── Page Body ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Page Title ── */}
        <div className="mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View the full details of this job listing.
          </p>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 px-6 sm:px-8 py-6">
          {/* ── Header Row ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-gray-400">
                  {jobDetails?.company?.companyName?.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {jobDetails?.title}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {jobDetails?.company?.companyName}
                </p>
              </div>
            </div>
            {/* Status badge */}
            <Badge className={`${status.bg} ${status.text} self-start`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </Badge>
          </div>

          {/* ── Quick-glance chips ── */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge className="bg-gray-100 text-gray-700">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {jobDetails?.location}
            </Badge>
            <Badge className="bg-gray-100 text-gray-700">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {jobDetails ? JOB_TYPE_LABELS[jobDetails?.jobType] : "N/A"}
            </Badge>
            <Badge className="bg-gray-100 text-gray-700">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              {jobDetails?.category}
            </Badge>
            {!jobDetails?.isActive && (
              <Badge className="bg-red-50 text-red-600">Inactive</Badge>
            )}
          </div>

          {/* ═══ Section: Job Info ═══ */}
          <SectionDivider title="Job Info" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
            <InfoField
              label="Salary Range"
              value={formatSalary(jobDetails?.salaryMin, jobDetails?.salaryMax)}
            />
            <InfoField
              label="Experience"
              value={formatExperience(
                jobDetails?.experienceMin,
                jobDetails?.experienceMax,
              )}
            />
            <InfoField
              label="Positions"
              value={`${jobDetails?.positions} open position${jobDetails?.positions !== 1 ? "s" : ""}`}
            />
            <InfoField
              label="Applicants"
              value={`${jobDetails?.applicantsCount} applicant${jobDetails?.applicantsCount !== 1 ? "s" : ""}`}
            />
            <InfoField
              label="Application Deadline"
              value={
                jobDetails?.applicationDeadline ? (
                  <span className="flex flex-col">
                    <span>
                      {formatDate(
                        jobDetails ? jobDetails?.applicationDeadline : null,
                      )}
                    </span>
                    {days !== null && (
                      <span
                        className={`text-xs mt-0.5 ${days <= 7 ? "text-red-500" : "text-gray-400"}`}
                      >
                        {days > 0
                          ? `${days} days remaining`
                          : "Deadline passed"}
                      </span>
                    )}
                  </span>
                ) : (
                  "No deadline"
                )
              }
            />
            <InfoField
              label="Posted On"
              value={formatDate(jobDetails ? jobDetails?.createdAt : null)}
            />
            <InfoField
              label="Last Updated"
              value={formatDate(jobDetails ? jobDetails?.updatedAt : null)}
            />
            <InfoField label="Posted By" value={jobDetails?.createdBy.name} />
          </div>

          {/* ═══ Section: Description ═══ */}
          <SectionDivider title="Job Description" />
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {jobDetails?.description}
          </div>

          {/* ═══ Section: Required Skills ═══ */}
          <SectionDivider title="Required Skills" />
          <div className="flex flex-wrap gap-2">
            {jobDetails?.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-medium text-orange-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
