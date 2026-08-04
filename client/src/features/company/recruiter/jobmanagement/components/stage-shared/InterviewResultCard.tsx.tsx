// components/stage-shared/InterviewResultCard.tsx
import React, { useState } from "react";
import type { ApiStageCandidate } from "../../pages/JobDetailsLayout";
import {
  CandidateAvatarBlock,
  FeedbackBox,
  PassFailToggle,
  PillButton,
} from "./InterviewPrimitives";

/** Card shown once the interviewer has submitted their side — recruiter reviews and finalizes. */
export const InterviewResultCard: React.FC<{
  candidate: ApiStageCandidate;
  title?: string;
  feedbackLabel: string;
  onSubmitResult: (result: "PASS" | "FAIL", feedback: string) => Promise<void>;
}> = ({ candidate, title, feedbackLabel, onSubmitResult }) => {
  const name = candidate.application?.userId?.name ?? "Unknown candidate";
  const [result, setResult] = useState<"PASS" | "FAIL" | null>(null);
  const [feedback, setFeedback] = useState(candidate.feedback ?? "");
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
