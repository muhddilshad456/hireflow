import React from "react";
import { Sparkles, X, ShieldCheck, Users, AlertCircle } from "lucide-react";

interface AiFilterConfirmModalProps {
  jobTitle: string;
  applicantsCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AiFilterConfirmModal({
  jobTitle,
  applicantsCount,
  onCancel,
  onConfirm,
}: AiFilterConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/45 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-blue-600" />
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 m-0">
              Run AI Auto-Select?
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-4 pb-1">
          <p className="text-sm text-slate-600 leading-relaxed">
            AI will review all{" "}
            <span className="font-semibold text-slate-900">
              {applicantsCount} candidate{applicantsCount !== 1 ? "s" : ""}
            </span>{" "}
            currently in{" "}
            <span className="font-semibold text-slate-900">Resume Review</span>{" "}
            for <span className="font-semibold text-slate-900">{jobTitle}</span>
            , and rank them by how well their profile matches this job's
            requirements.
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex gap-3">
              <Users size={17} className="text-slate-400 mt-0.5 shrink-0" />
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Only each candidate's{" "}
                <span className="font-medium text-slate-700">
                  skills, experience, and education
                </span>{" "}
                from their profile are compared against the job's requirements —
                no personal identifiers like name, age, or gender are used in
                scoring.
              </p>
            </div>
            <div className="flex gap-3">
              <ShieldCheck
                size={17}
                className="text-slate-400 mt-0.5 shrink-0"
              />
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Scores and match reasoning are a{" "}
                <span className="font-medium text-slate-700">
                  starting point for review
                </span>
                , not a final decision. You'll see the full reasoning for every
                score and choose who to move forward yourself.
              </p>
            </div>
            <div className="flex gap-3">
              <AlertCircle
                size={17}
                className="text-amber-500 mt-0.5 shrink-0"
              />
              <p className="text-[13px] text-slate-500 leading-relaxed">
                AI matching can occasionally misjudge nuance — we recommend
                skimming lower-ranked profiles too before making final
                decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-6 pt-5 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-none bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700"
          >
            <Sparkles size={15} />
            Run AI Filter
          </button>
        </div>
      </div>
    </div>
  );
}
