import React, { useEffect, useState } from "react";
import { Header } from "../../shared/components/Header";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import {
  getMyApplication,
  withdrawMyApplication,
} from "../../../shared/services/applicationService";

/* ----------------------------- Types ----------------------------- */

interface ApiJobStage {
  _id: string;
  name: string;
  order: number;
  isMandatory: boolean;
  status: "PENDING" | "IN_PROGRESS" | "PASSED" | "FAILED";
  feedback?: string;
  interviewerId?: string;
  startedAt?: string;
  completedAt?: string;
  applicationStageId?: string;
}

interface ApiJob {
  _id: string;
  company: string; // ObjectId today — populate on backend to get a name
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
}

interface ApiApplication {
  _id: string;
  resumeUrl: string;
  coverLetter: string;
  status:
    | "APPLIED"
    | "IN_PROGRESS"
    | "OFFERED"
    | "REJECTED"
    | "WITHDRAWN"
    | string;
  appliedAt: string;
  currentStageId: string;
  job: ApiJob;
  stages: ApiJobStage[];
}

export type StageStatus = "completed" | "active" | "pending" | "failed";

export interface Stage {
  id: string;
  name: string;
  label: string;
  status: StageStatus;
  /** Where clicking this stage should take the user */
  href?: string;
}

export interface JobDetail {
  label: string;
  value: string;
}

export interface AppliedJobData {
  jobTitle: string;
  companyName: string;
  location: string;
  details: JobDetail[];
  successTitle: string;
  successSubtitle: string;
  appliedOn: string;
  applicationId: string;
  status: ApiApplication["status"];
  stages: Stage[];
  resumeFileName: string;
  resumeFileSize: string;
  resumeUrl: string;
  avatarUrl?: string;
}

/* --------------------------- Icons (inline) --------------------------- */

const IconPin: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconCheck: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M5 13l4.5 4.5L19 7"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconAlert: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 9v4.5M12 16.5h.01M10.6 3.6 2.9 17.1a1.6 1.6 0 0 0 1.4 2.4h15.4a1.6 1.6 0 0 0 1.4-2.4L13.4 3.6a1.6 1.6 0 0 0-2.8 0Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

/* --------------------------- JobDetailRow --------------------------- */

const JobDetailRow: React.FC<JobDetail> = ({ label, value }) => (
  <p className="text-[13px] leading-6 text-slate-500">
    <span className="text-slate-500">{label}</span> :{" "}
    <span className="text-slate-500">{value}</span>
  </p>
);

/* --------------------------- SuccessBanner --------------------------- */

const SuccessBanner: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <div className="flex items-center gap-3 rounded-xl bg-emerald-100 px-4 py-3">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
      <IconCheck className="h-4 w-4" />
    </span>
    <div>
      <p className="text-sm font-semibold text-emerald-900">{title}</p>
      <p className="text-xs text-emerald-800/80">{subtitle}</p>
    </div>
  </div>
);

/* --------------------------- JobCard --------------------------- */

interface JobCardProps {
  jobTitle: string;
  companyName: string;
  location: string;
  details: JobDetail[];
  successTitle: string;
  successSubtitle: string;
  appliedOn: string;
  applicationId: string;
  status: string;
  onWithdraw: () => void;
  isWithdrawing: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  jobTitle,
  companyName,
  location,
  details,
  successTitle,
  successSubtitle,
  appliedOn,
  applicationId,
  status,
  onWithdraw,
  isWithdrawing,
}) => {
  const canWithdraw =
    status !== "WITHDRAWN" && status !== "REJECTED" && status !== "OFFERED";

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-white p-5 sm:p-6">
      <h2 className="text-2xl font-extrabold italic text-slate-900 sm:text-[26px]">
        {jobTitle}
      </h2>
      <p className="mt-2 text-sm font-medium text-slate-700">{companyName}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
        <IconPin className="h-3.5 w-3.5" />
        {location}
      </p>

      <hr className="my-4 border-slate-100" />

      <div className="space-y-1">
        {details.map((d) => (
          <JobDetailRow key={d.label} label={d.label} value={d.value} />
        ))}
      </div>

      <div className="my-5">
        {status === "WITHDRAWN" ? (
          <div className="rounded-xl bg-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-700">
              Application Withdrawn
            </p>
          </div>
        ) : (
          <SuccessBanner title={successTitle} subtitle={successSubtitle} />
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[13px] text-slate-500">Applied on : {appliedOn}</p>
        <p className="text-[13px] text-slate-500">
          Application Id : {applicationId}
        </p>
      </div>

      {canWithdraw && (
        <button
          type="button"
          onClick={onWithdraw}
          disabled={isWithdrawing}
          className="mt-4 rounded-full border border-red-300 px-4 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isWithdrawing ? "Withdrawing…" : "Withdraw Application"}
        </button>
      )}
    </div>
  );
};

/* --------------------------- StageFlow --------------------------- */

interface StageNodeProps {
  stage: Stage;
  isLast: boolean;
  onNavigate?: (stage: Stage) => void;
}

const StageNode: React.FC<StageNodeProps> = ({ stage, isLast, onNavigate }) => {
  const isClickable =
    stage.status === "completed" ||
    stage.status === "active" ||
    stage.status === "failed";

  const circleClasses =
    stage.status === "active"
      ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
      : stage.status === "completed"
        ? "bg-orange-500 text-white"
        : stage.status === "failed"
          ? "bg-red-500 text-white"
          : "bg-white/70 text-slate-400";

  const labelClasses =
    stage.status === "pending"
      ? "text-slate-500/70 font-medium"
      : stage.status === "failed"
        ? "text-red-600 font-bold"
        : "text-slate-900 font-bold";

  const handleClick = () => {
    if (!isClickable) return;
    onNavigate?.(stage);
  };

  return (
    <div className="relative flex items-center gap-3 pb-6 last:pb-0">
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[15px] top-8 h-[calc(100%-0.9rem)] w-px bg-slate-900/70"
        />
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={!isClickable}
        aria-current={stage.status === "active" ? "step" : undefined}
        className={[
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform",
          circleClasses,
          isClickable
            ? "cursor-pointer hover:scale-105 active:scale-95"
            : "cursor-default",
        ].join(" ")}
      >
        {stage.status === "completed" && <IconCheck className="h-3.5 w-3.5" />}
        {stage.status === "failed" && <IconAlert className="h-3.5 w-3.5" />}
      </button>

      {isClickable ? (
        <button
          type="button"
          onClick={handleClick}
          className={`text-left text-[13px] sm:text-sm ${labelClasses} hover:underline`}
        >
          {stage.label}
        </button>
      ) : (
        <span className={`text-[13px] sm:text-sm ${labelClasses}`}>
          {stage.label}
        </span>
      )}
    </div>
  );
};

const StageFlow: React.FC<{
  stages: Stage[];
  onNavigate?: (stage: Stage) => void;
}> = ({ stages, onNavigate }) => (
  <div className="h-fit rounded-2xl bg-red-200/70 px-5 py-5 sm:px-5">
    {stages.map((stage, i) => (
      <StageNode
        key={stage.id}
        stage={stage}
        isLast={i === stages.length - 1}
        onNavigate={onNavigate}
      />
    ))}
  </div>
);
/* --------------------------- Loading / Error states --------------------------- */

const PageSkeleton: React.FC = () => (
  <div className="mx-auto max-w-6xl animate-pulse px-4 py-8 sm:px-6 lg:px-10">
    <div className="mb-6 h-7 w-40 rounded bg-slate-200" />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
      <div>
        <div className="h-96 rounded-2xl border-2 border-slate-100 bg-slate-50" />
        <div className="mt-5 h-24 rounded-2xl border border-slate-100 bg-slate-50" />
      </div>
      <div className="h-64 rounded-2xl bg-slate-100" />
    </div>
  </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
      <IconAlert className="h-6 w-6" />
    </span>
    <p className="text-sm font-medium text-slate-700">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
    >
      Try again
    </button>
  </div>
);

/* --------------------------- Mapping layer --------------------------- */

function mapStageStatus(status: ApiJobStage["status"]): StageStatus {
  switch (status) {
    case "PASSED":
      return "completed";
    case "IN_PROGRESS":
      return "active";
    case "FAILED":
      return "failed";
    case "PENDING":
    default:
      return "pending";
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatSalary(min: number, max: number): string {
  return `${min}-${max} LPA`;
}

function formatExperience(min: number, max: number): string {
  return `${min} - ${max} yrs`;
}

function filenameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").pop() ?? "resume");
  } catch {
    return "resume";
  }
}

function mapApplicationToAppliedJobData(app: ApiApplication): AppliedJobData {
  const { job } = app;

  const stages: Stage[] = [...app.stages]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      id: s._id,
      name: s.name,
      label: s.name
        .split("_")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" "),
      status: mapStageStatus(s.status),
      href:
        s.status !== "PENDING"
          ? `/application/${app._id}/stage/${s._id}`
          : undefined,
    }));

  return {
    jobTitle: job.title,
    companyName: "—", // populate `company` on the backend for a real name
    location: job.location,
    details: [
      { label: "Type", value: job.jobType.replace("_", " ") },
      {
        label: "Experience",
        value: formatExperience(job.experienceMin, job.experienceMax),
      },
      { label: "Salary", value: formatSalary(job.salaryMin, job.salaryMax) },
      { label: "Openings", value: String(job.positions) },
      {
        label: "Application Deadline",
        value: formatDate(job.applicationDeadline),
      },
    ],
    successTitle:
      app.status === "IN_PROGRESS"
        ? "Application In Progress"
        : "CV Submitted Successfully",
    successSubtitle: "You will be notified once the next step is unlocked",
    appliedOn: formatDate(app.appliedAt),
    applicationId: app._id,
    status: app.status,
    stages,
    resumeFileName: filenameFromUrl(app.resumeUrl),
    resumeFileSize: "—",
    resumeUrl: app.resumeUrl,
    avatarUrl: undefined,
  };
}

/* --------------------------- Page --------------------------- */

export const AppliedJobPage = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<AppliedJobData | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const loadData = async () => {
    if (!applicationId) {
      setErrorMessage("No application id in the URL");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await getMyApplication(applicationId);
      console.log("fetched application details : ", res);
      const application: ApiApplication = res.data;
      setData(mapApplicationToAppliedJobData(application));
      setStatus("success");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ??
          error?.message ??
          "Failed to load application",
      );
      setStatus("error");
    }
  };

  useEffect(() => {
    loadData();
  }, [applicationId]);

  const handleWithdraw = async () => {
    if (!applicationId) return;
    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?",
    );
    if (!confirmed) return;

    setIsWithdrawing(true);
    try {
      await withdrawMyApplication(applicationId);
      await loadData(); // refresh so status flips to WITHDRAWN
    } catch (error: any) {
      alert(
        error?.response?.data?.message ??
          error?.message ??
          "Failed to withdraw application",
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleStageNavigate = (stage: Stage) => {
    if (stage.href) navigate(stage.href);
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <Header />
      {status === "loading" && <PageSkeleton />}
      {status === "error" && (
        <ErrorState
          message={errorMessage || "Failed to load application"}
          onRetry={loadData}
        />
      )}
      {status === "success" && data && (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
          <h1 className="mb-6 text-2xl font-bold text-slate-900 sm:text-[28px]">
            Applied Job
          </h1>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div>
              <JobCard
                jobTitle={data.jobTitle}
                companyName={data.companyName}
                location={data.location}
                details={data.details}
                successTitle={data.successTitle}
                successSubtitle={data.successSubtitle}
                appliedOn={data.appliedOn}
                applicationId={data.applicationId}
                status={data.status}
                onWithdraw={handleWithdraw}
                isWithdrawing={isWithdrawing}
              />
              <Outlet context={{ application: data }} />
            </div>
            <StageFlow stages={data.stages} onNavigate={handleStageNavigate} />
          </div>
        </main>
      )}
    </div>
  );
};
