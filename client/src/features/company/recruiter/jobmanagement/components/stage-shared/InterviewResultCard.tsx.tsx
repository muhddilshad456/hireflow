import React, { useState } from "react";
import {
  CandidateAvatarBlock,
  FeedbackBox,
  PassFailToggle,
  PillButton,
} from "./InterviewPrimitives";
import type { ApiStageCandidate } from "../../../../../../types/applicaionTypes";

export const InterviewResultCard: React.FC<{
  candidate: ApiStageCandidate;
  title?: string;
  feedbackLabel: string;
  onSubmitResult: (result: "PASS" | "FAIL", feedback: string) => Promise<void>;
}> = ({ candidate, title, feedbackLabel, onSubmitResult }) => {
  const name = candidate.application?.userId?.name ?? "Unknown candidate";
  const progress = candidate.interviewProgress;
  const [result, setResult] = useState<"PASS" | "FAIL" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!result) return;
    setSubmitting(true);
    try {
      await onSubmitResult(result, feedback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
          {candidate.application?.resumeUrl && (
            <button
              onClick={() =>
                window.open(candidate.application!.resumeUrl, "_blank")
              }
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
            >
              View CV
            </button>
          )}
        </div>
        <CandidateAvatarBlock className="h-20 w-32" />
      </div>

      {/* ---- Interviewer's own submission, read-only ---- */}
      <div className="mt-4 rounded-xl bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            {progress?.interviewer?.name ?? "Interviewer"}'s assessment
          </span>
          {typeof progress?.score === "number" && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Score: {progress.score}/100
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-700">
          {progress?.feedback || "No written feedback provided."}
        </p>
      </div>

      {/* ---- Recruiter's own review ---- */}
      <FeedbackBox
        label={feedbackLabel}
        value={feedback}
        onChange={setFeedback}
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <PassFailToggle value={result} onChange={setResult} />
        </div>
        <PillButton onClick={handleSubmit} disabled={!result || submitting}>
          Submit Result
        </PillButton>
      </div>
    </div>
  );
};
