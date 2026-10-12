import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { GetInterviewDetailsResponse } from "../../../../../types/interview/interview";
import {
  getInterviewDetails,
  submitInterviewFeedback,
} from "../services/interviewServices";
import toast from "react-hot-toast";
import { Video } from "lucide-react";

function formatStageName(name: string) {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} • ${time}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatusBadge({
  status,
}: {
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}) {
  const config = {
    SCHEDULED: { label: "Upcoming", classes: "bg-blue-50 text-blue-600" },
    COMPLETED: {
      label: "Completed",
      classes: "bg-emerald-50 text-emerald-600",
    },
    CANCELLED: { label: "Cancelled", classes: "bg-red-50 text-red-500" },
  }[status];
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

export function InterviewDetailsPage() {
  const { id: interviewId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<GetInterviewDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    if (!interviewId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getInterviewDetails(interviewId);
      console.log("result of interviews fetch : ", result);
      setData(result);
      setFeedbackText(result.interview.feedback ?? "");
    } catch (error: any) {
      console.log(error?.response);
      setError(
        error?.response?.data?.message || "Failed to load interview details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [interviewId]);

  const handleSubmitFeedback = async () => {
    if (!interviewId || !feedbackText.trim()) return;
    setSubmitting(true);
    try {
      const result = await submitInterviewFeedback(
        interviewId,
        feedbackText.trim(),
      );
      console.log("result of feedback submit : ", result);
      setIsEditingFeedback(false);
      fetchDetails();
      toast.success("Feedback Submitted.");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to save feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="p-6 text-center text-sm text-slate-400">
        Loading interview details...
      </p>
    );
  }

  if (error && !data) {
    return <p className="p-6 text-center text-sm text-red-500">{error}</p>;
  }

  if (!data) return null;

  const {
    interview,
    application,
    candidate,
    job,
    userProfile,
    jobStage,
    recruiter,
  } = data;

  const hasFeedback = !!interview.feedback;
  const showFeedbackForm = !hasFeedback || isEditingFeedback;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            Interview Details
          </h1>
          <StatusBadge status={interview.status} />
        </div>

        {interview.status === "SCHEDULED" && (
          <button
            onClick={() =>
              navigate(`/company/interviewer/interview/${interviewId}`)
            }
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:translate-y-0"
          >
            <Video
              size={18}
              className="transition-transform group-hover:scale-110"
            />
            Join Interview
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Review candidate information and submit your evaluation.
      </p>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {/* Overview card */}
      <div className="mt-5 flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-5 sm:flex-row">
        <div className="flex-1">
          <h2 className="text-base font-bold text-slate-900">
            {candidate.name}
          </h2>
          <p className="text-sm font-medium text-blue-600">
            {job.title} • {formatStageName(jobStage.name)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">
                Date &amp; Time
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {formatDateTime(interview.scheduledAt)}
              </p>
            </div>
            {interview.duration && (
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Duration
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {interview.duration} Minutes
                </p>
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">
                Assigned By
              </p>
              <p className="mt-1 text-sm text-slate-700">{recruiter.name}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 sm:w-40 sm:border-l sm:border-slate-100 sm:pl-5">
          {candidate.profilePicture ? (
            <img
              src={candidate.profilePicture}
              alt={candidate.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-lg font-semibold text-emerald-600">
              {initials(candidate.name)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {/* Candidate profile card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900">
            Candidate Profile
          </h3>

          <div className="mt-3 flex justify-between text-[13px]">
            <span className="text-slate-400">Email</span>
            <span className="text-slate-700">{candidate.email}</span>
          </div>

          {userProfile?.skills && userProfile.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-[13px] text-slate-400">Skills</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {userProfile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {userProfile?.experience && userProfile.experience.length > 0 && (
            <div className="mt-4">
              <p className="text-[13px] text-slate-400">Experience</p>
              <div className="mt-2 space-y-2">
                {userProfile.experience.map((exp) => (
                  <div key={exp._id} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[13px] font-semibold text-slate-800">
                      {exp.title}{" "}
                      <span className="font-normal text-slate-500">
                        @ {exp.company}
                      </span>
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {exp.years} yrs
                    </p>
                    {exp.description && (
                      <p className="mt-1 text-[12px] text-slate-500">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!userProfile ||
            (!userProfile.skills?.length &&
              !userProfile.experience?.length)) && (
            <p className="mt-3 text-[13px] text-slate-400">
              This candidate hasn't completed their profile yet.
            </p>
          )}
        </div>

        {/* Documents card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900">Documents</h3>

          <a
            href={application.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-lg border border-slate-100 px-3 py-2 text-[13px] font-medium text-blue-600 hover:bg-slate-50"
          >
            View Resume
          </a>

          {application.coverLetter && (
            <div className="mt-3">
              <p className="text-[13px] font-semibold text-slate-700">
                Cover Letter
              </p>
              <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-[13px] text-slate-600">
                {application.coverLetter}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback card */}
      <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-slate-100 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">Feedback</h3>

        {!showFeedbackForm ? (
          <>
            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-[13px] italic text-slate-600">
              "{interview.feedback}"
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[12px] text-slate-400">
                {interview.feedbackSubmittedAt &&
                  `Submitted at ${formatDateTime(interview.feedbackSubmittedAt)}`}
              </span>
              <button
                onClick={() => setIsEditingFeedback(true)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit feedback
              </button>
            </div>
          </>
        ) : (
          <>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={5}
              placeholder="Write your evaluation of the candidate..."
              className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <div className="mt-3 flex justify-end gap-2">
              {hasFeedback && (
                <button
                  disabled={submitting}
                  onClick={() => {
                    setIsEditingFeedback(false);
                    setFeedbackText(interview.feedback ?? "");
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
              <button
                disabled={submitting || !feedbackText.trim()}
                onClick={handleSubmitFeedback}
                className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Submit feedback"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
