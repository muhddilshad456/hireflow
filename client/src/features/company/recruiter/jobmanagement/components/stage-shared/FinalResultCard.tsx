import React from "react";
import { CandidateAvatarBlock } from "./InterviewPrimitives";
import type { ApiStageCandidate } from "../../../../../../types/applicaionTypes";

export const FinalResultCard: React.FC<{
  candidate: ApiStageCandidate;
}> = ({ candidate }) => {
  const name = candidate.application?.userId?.name ?? "Unknown candidate";
  const progress = candidate.interviewProgress;
  const passed = candidate.status === "PASSED";

  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              passed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {passed ? "Passed" : "Failed"}
          </span>
        </div>
        <CandidateAvatarBlock className="h-20 w-32" />
      </div>

      {typeof progress?.score === "number" && (
        <p className="mt-3 text-xs text-gray-500">
          Interview score: {progress.score}/100
        </p>
      )}
      {progress?.feedback && (
        <p className="mt-2 text-sm text-gray-700">{progress.feedback}</p>
      )}
      {candidate.feedback && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          <span className="text-xs font-medium text-gray-500">
            Recruiter note:{" "}
          </span>
          {candidate.feedback}
        </div>
      )}
    </div>
  );
};
