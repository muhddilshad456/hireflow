import React, { useEffect, useState } from "react";
import { MapPin, Briefcase, Wallet, Users, CalendarClock } from "lucide-react";
import { Header } from "../../shared/components/Header";
import { useLocation } from "react-router-dom";
import { getJobApi } from "../../../shared/services/jobService";
import { ApplyModal } from "../components/applyModal";
import { checkApplicationStatus } from "../services/userJobService";

export interface JobDetailData {
  _id: string;
  company: string;
  createdBy: string;

  title: string;
  category: string;
  description: string;
  location: string;
  jobType: string;

  salaryMin: number;
  salaryMax: number;

  skills: string[];

  experienceMin: number;
  experienceMax: number;

  status: string;

  applicationDeadline: string;

  positions: number;
  applicantsCount: number;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

interface JobDetailCardProps {
  job: JobDetailData | null;
  isApplied: boolean;
  onSave?: () => void;
  onApply?: () => void;
}

// ---- formatting helpers -----------------------------------------------

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `₹${value.toLocaleString("en-IN")}`;
};

const daysUntil = (value?: string) => {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const diff = Math.ceil(
    (target.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24),
  );
  return diff;
};

// ---- main card -----------------------------------------------------------

export const JobDetailCard: React.FC<JobDetailCardProps> = ({
  job,
  isApplied,
  onSave,
  onApply,
}) => {
  const stats = [
    { label: "Job type", value: job?.jobType || "—", icon: Briefcase },
    {
      label: "Experience",
      value:
        job?.experienceMin !== undefined && job?.experienceMax !== undefined
          ? `${job.experienceMin}–${job.experienceMax} yrs`
          : "—",
      icon: Users,
    },
    {
      label: "Salary",
      value: `${formatCurrency(job?.salaryMin)} – ${formatCurrency(
        job?.salaryMax,
      )}`,
      icon: Wallet,
    },
    {
      label: "Openings",
      value: job?.positions !== undefined ? String(job.positions) : "—",
      icon: Users,
    },
  ];

  const deadlineDays = daysUntil(job?.applicationDeadline);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            {job?.category && (
              <span className="inline-block text-[12px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-3">
                {job.category}
              </span>
            )}
            <h1 className="font-display font-bold text-[28px] text-slate-900 leading-tight mb-2">
              {job?.title || "Untitled role"}
            </h1>
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="text-[14px]">
                {job?.location || "Location not specified"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0 w-36">
            <Button variant="save" size="md" fullWidth onClick={onSave}>
              Save
            </Button>
            <div className="group/apply relative">
              <Button
                variant="apply"
                size="md"
                fullWidth
                disabled={isApplied}
                onClick={isApplied ? undefined : onApply}
              >
                {isApplied ? "Applied" : "Apply"}
              </Button>
              {isApplied && (
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-[12px] text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/apply:opacity-100 z-10">
                  You already applied
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-800" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stat band */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-3"
            >
              <div className="flex items-center gap-1.5 text-orange-400 mb-1">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium text-slate-500">
                  {label}
                </span>
              </div>
              <p className="text-[14px] font-semibold text-slate-800 truncate">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Deadline */}
        <div className="mt-4 flex items-center gap-2 text-[13px] text-slate-500">
          <CalendarClock className="w-4 h-4" />
          <span>
            Apply by{" "}
            <span className="font-medium text-slate-700">
              {formatDate(job?.applicationDeadline)}
            </span>
            {deadlineDays !== null && deadlineDays >= 0 && (
              <span className="text-slate-400">
                {" "}
                ·{" "}
                {deadlineDays === 0
                  ? "closes today"
                  : `${deadlineDays} day${deadlineDays === 1 ? "" : "s"} left`}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-7">
        <Section title="Description">
          <p className="whitespace-pre-line">{job?.description}</p>
        </Section>

        {job?.skills && job.skills.length > 0 && (
          <Section title="Skills required">
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[12.5px] font-medium text-slate-600 bg-slate-100 rounded-full px-3 py-1"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "save" | "apply";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  disabled = false,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer disabled:cursor-not-allowed disabled:active:scale-100";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  const variants = {
    primary:
      "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300",
    save: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-400",
    apply: disabled
      ? "bg-slate-200 text-slate-500 hover:bg-slate-200 focus:ring-slate-200"
      : "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div className={`mb-6 last:mb-0 ${className}`}>
      <h3 className="text-[15px] font-display font-semibold text-slate-800 mb-2">
        {title}
      </h3>
      <div className="text-[13.5px] text-slate-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default function Job() {
  const [job, setJob] = useState<JobDetailData | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  const location = useLocation();
  const jobId = location.state?.jobId;

  const getJob = async () => {
    try {
      const result = await getJobApi(jobId);
      setJob(result.data);
    } catch (error: any) {
      console.log(error?.response?.data);
    }
  };

  const getApplicationStatus = async () => {
    try {
      const result = await checkApplicationStatus(jobId);
      setIsApplied(Boolean(result?.data?.isApplied));
    } catch (error: any) {
      console.log(error?.response?.data);
    }
  };

  useEffect(() => {
    getJob();
    getApplicationStatus();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <JobDetailCard
          job={job}
          isApplied={isApplied}
          onSave={() => alert("Job saved!")}
          onApply={() => setIsApplyModalOpen(true)}
        />
      </main>
      <ApplyModal
        isOpen={isApplyModalOpen}
        jobId={jobId}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}
