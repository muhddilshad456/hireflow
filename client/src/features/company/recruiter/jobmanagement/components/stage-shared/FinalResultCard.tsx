import React from "react";
import type { ApiStageCandidate } from "../../../../../../types/applicaionTypes";

export const FinalResultCard: React.FC<{
  candidate: ApiStageCandidate;
}> = ({ candidate }) => {
  const progress = candidate?.applicationStage?.interviewProgress;
  const passed = candidate.status === "PASSED";

  return (
    <div className="mt-4 rounded-xl border border-slate-200 p-4">
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
          passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
        }`}
      >
        {passed ? "Passed" : "Failed"}
      </span>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div>
          <p className="text-xs font-semibold text-gray-500">
            Interviewer Feedback
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">
            {progress?.feedback?.trim() || "No interviewer feedback added yet."}
          </p>
        </div>

        <div className="my-3 border-t border-gray-200" />

        <div>
          <p className="text-xs font-semibold text-gray-500">Recruiter Note</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">
            {candidate?.applicationStage?.feedback?.trim() ||
              "No recruiter note added yet."}
          </p>
        </div>
      </div>
    </div>
  );
};
