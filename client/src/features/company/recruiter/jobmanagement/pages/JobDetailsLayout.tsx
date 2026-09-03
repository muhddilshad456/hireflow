import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Pencil,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CalendarClock,
} from "lucide-react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { jobDetails, updateJobApi } from "../services/jobServices";
import { EditJobModal } from "../components/jobEditModal";
import type { JobStageName } from "../../../../../constents/jobStages";
import toast from "react-hot-toast";
import type { JobFormData } from "../../../../../types/job/job/jobForm";
import AiFilterConfirmModal from "../components/AiConfirmationModal";
import ChatButton from "../components/chatButton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface JobMeta {
  location: string;
  jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
  salaryMin?: number;
  salaryMax?: number;
  positions: number;
  applicantsCount: number;
  applicationDeadline?: string;
}

export interface JobSummary {
  _id: string;
  title: string;
  category: string;
  status: "OPEN" | "CLOSED" | "FILLED";
  bannerUrl?: string;
  location: string;
  jobType: JobMeta["jobType"];
  salaryMin?: number;
  salaryMax?: number;
  positions: number;
  skills: string[];
  description: string;
  applicantsCount: number;
  applicationDeadline?: string;
}

export interface ApiJobStage {
  _id: string;
  name: JobStageName;
  order: number;
  assessmentTaskDescription?: string;
  assessmentTaskAttachmentUrl?: string;
  isMandatory: boolean;
  isActive: boolean;
}

/** The stage row is fully data-driven — length & labels vary per job */
export interface TimelineStage {
  id: string;
  name: string;
}

/** Shape handed to <Outlet context={...}/> and read by StageRenderer via useOutletContext */
export interface JobLayoutOutletContext {
  stages: ApiJobStage[];
  jobId: string;
  refetchJob: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatJobType = (type?: JobMeta["jobType"]) =>
  type
    ? {
        FULL_TIME: "Full-time",
        PART_TIME: "Part-time",
        INTERNSHIP: "Internship",
        CONTRACT: "Contract",
      }[type]
    : "—";

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return "Not disclosed";
  const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  return fmt((min ?? max)!);
};

const formatDeadline = (date?: string) => {
  if (!date) return "No deadline";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** "resume_review" -> "Resume Review" */
const toTitleCase = (raw: string) =>
  raw
    .replace(/[_-]/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

/**
 * Derives each stage's timeline state purely from the data your API
 * already returns — no extra backend field required.
 *
 * Rule: the furthest stage that has at least one candidate in it is
 * the CURRENT stage. Every stage before it is COMPLETED. Every stage
 * after it is LOCKED. If no stage has any candidates yet, the first
 * active stage is CURRENT and the rest are LOCKED.
 */
// change to
export const buildTimelineStages = (
  apiStages: ApiJobStage[],
): TimelineStage[] =>
  apiStages
    .filter((s) => s.isActive)
    .sort((a, b) => a.order - b.order)
    .map((stage) => ({
      id: stage._id,
      name: toTitleCase(stage.name),
    }));

const StageTimeline: React.FC<{
  stages: TimelineStage[];
  activeStageId: string;
  onSelect: (stageId: string) => void;
}> = ({ stages, activeStageId, onSelect }) => (
  <ol>
    {stages.map((stage, idx) => {
      const isActive = stage.id === activeStageId;
      return (
        <li
          key={stage.id}
          className="relative flex items-center gap-2.5 pb-4 last:pb-0"
        >
          {idx < stages.length - 1 && (
            <span className="absolute left-[5px] top-4 bottom-0 w-px -translate-x-1/2 border-l-2 border-dashed border-gray-200" />
          )}
          <button
            type="button"
            onClick={() => onSelect(stage.id)}
            className="flex items-center gap-2.5 text-left"
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                isActive ? "bg-gray-900" : "border border-gray-300 bg-white"
              }`}
            />
            <span
              className={`whitespace-nowrap text-sm transition ${
                isActive
                  ? "font-semibold text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {stage.name}
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);

/* ------------------------------------------------------------------ */
/*  Main page — now a route shell only. Candidate rendering lives in   */
/*  StageRenderer, reached through the <Outlet>.                       */
/* ------------------------------------------------------------------ */

export const JobLayout: React.FC = () => {
  const { jobId, stageId } = useParams<{ jobId: string; stageId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobSummary | null>(null);
  const [apiStages, setApiStages] = useState<ApiJobStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEditJobModal, setOpenEditJobModal] = useState(false);
  const [showAiConfirm, setShowAiConfirm] = useState(false);

  const getJobDetails = async () => {
    if (!jobId) {
      console.log("job id is missing");
      return;
    }
    try {
      setLoading(true);
      const result = await jobDetails(jobId);
      const data = result?.data?.data ?? result?.data; // adjust to your axios wrapper shape
      setJob(data.job);
      setApiStages(data.stages ?? []);

      if (stageId === "first" && data.stages?.length) {
        const first = [...(data.stages as ApiJobStage[])]
          .filter((s) => s.isActive)
          .sort((a, b) => a.order - b.order)[0];

        if (first) {
          navigate(`/company/recruiter/job/${jobId}/stage/${first._id}`, {
            replace: true,
          });
        }
      }
    } catch (error: any) {
      console.log(error?.response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getJobDetails();
  }, [jobId, stageId]);

  // change to
  const timeline = buildTimelineStages(apiStages);
  const selectedStageId = stageId ?? timeline[0]?.id ?? "";

  const handleStageSelect = (id: string) => {
    navigate(`/company/recruiter/job/${jobId}/stage/${id}`);
  };

  const handleEditJob = () => {
    setOpenEditJobModal(true);
  };

  const handleEditJobSubmit = async (data: JobFormData) => {
    if (!jobId) {
      console.log("Job id missing.");
      throw new Error("Job id missing.");
    }
    const result = await updateJobApi(jobId, data);
    toast.success("Job updated.");
    await getJobDetails();
  };

  const handleRunAutoSelect = () => {
    setShowAiConfirm(false);
    navigate(`/company/recruiter/job/${jobId}/ai-filter-results`);
  };

  if (loading && !job) {
    return (
      <main className="flex-1 bg-gray-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          {/* Header */}
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 h-8 w-2/3 rounded bg-gray-200" />
            <div className="mb-6 h-4 w-1/3 rounded bg-gray-200" />

            <div className="flex flex-wrap gap-3">
              <div className="h-8 w-24 rounded-full bg-gray-200" />
              <div className="h-8 w-28 rounded-full bg-gray-200" />
              <div className="h-8 w-20 rounded-full bg-gray-200" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Job Description */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-5 h-6 w-40 rounded bg-gray-200" />

                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-5/6 rounded bg-gray-200" />
                  <div className="h-4 w-4/6 rounded bg-gray-200" />
                </div>
              </div>

              {/* Requirements */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-5 h-6 w-48 rounded bg-gray-200" />

                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-gray-200" />
                      <div className="h-4 flex-1 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Apply Card */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 h-6 w-32 rounded bg-gray-200" />

                <div className="space-y-4">
                  <div className="h-12 rounded-lg bg-gray-200" />
                  <div className="h-12 rounded-lg bg-gray-200" />
                </div>
              </div>

              {/* Company Card */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="mb-2 h-5 w-32 rounded bg-gray-200" />
                    <div className="h-4 w-24 rounded bg-gray-200" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-5/6 rounded bg-gray-200" />
                  <div className="h-4 w-4/6 rounded bg-gray-200" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="flex-1 bg-gray-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-10 w-10 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.172 9.172a4 4 0 015.656 0m0 0a4 4 0 010 5.656m0-5.656L21 3m-6.172 6.172L3 21"
                />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-900">Job Not Found</h1>

            {/* Description */}
            <p className="mt-4 text-gray-600">
              The job you're looking for may have been removed, expired, or the
              link is incorrect.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() => window.history.back()}
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
              >
                ← Go Back
              </button>

              <button
                onClick={() => (window.location.href = "/jobs")}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
              >
                Browse Jobs
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-1 py-1 sm:px-6 lg:px-10 lg:py-8">
      <div className="grid grid-cols-[1fr_200px] gap-x-10 gap-y-8 max-sm:grid-cols-1">
        {/* Left column: everything except the stage list */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Job Details &amp; Hiring Flow Management
          </h1>
          <button
            onClick={() => setShowAiConfirm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Sparkles className="h-4 w-4" />
            Run AI Auto-Select
          </button>
          {/* Job summary row (title + banner) */}
          <div className="mt-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {job.title}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {job.category} &middot;{" "}
                <span
                  className={
                    job.status === "OPEN" ? "text-emerald-600" : "text-gray-500"
                  }
                >
                  {job.status === "OPEN"
                    ? "Open"
                    : job.status === "FILLED"
                      ? "Filled"
                      : "Closed"}
                </span>
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleEditJob}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Edit Job
                  <Pencil className="h-3 w-3" />
                </button>

                <ChatButton jobId={jobId!} />
              </div>

              <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2 text-xs text-gray-500 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatJobType(job.jobType)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {job.positions} position{job.positions !== 1 ? "s" : ""}{" "}
                    &middot; {job.applicantsCount} applicants
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Apply by {formatDeadline(job.applicationDeadline)}
                  </span>
                </div>
              </dl>
            </div>

            <div
              className="h-24 w-full shrink-0 rounded-xl bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100 sm:w-40"
              style={
                job.bannerUrl
                  ? {
                      backgroundImage: `url(${job.bannerUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            />
          </div>
          {/* Stage-specific content renders here via StageRenderer */}
          <section className="mt-8">
            <Outlet
              context={
                {
                  stages: apiStages,
                  jobId: jobId!,
                  refetchJob: getJobDetails,
                } satisfies JobLayoutOutletContext
              }
            />
          </section>
        </div>

        {/* Right column: vertical stage list, top-aligned next to the
            title/banner row. Fully data-driven length. */}
        <div className="pt-1 max-sm:pt-0">
          <StageTimeline
            stages={timeline}
            activeStageId={selectedStageId}
            onSelect={handleStageSelect}
          />
        </div>
      </div>
      {openEditJobModal && (
        <EditJobModal
          job={job}
          stages={apiStages}
          onSubmit={handleEditJobSubmit}
          onClose={() => setOpenEditJobModal(false)}
        />
      )}
      {showAiConfirm && (
        <AiFilterConfirmModal
          jobTitle={job.title}
          applicantsCount={job.applicantsCount}
          onCancel={() => setShowAiConfirm(false)}
          onConfirm={handleRunAutoSelect}
        />
      )}
    </main>
  );
};
