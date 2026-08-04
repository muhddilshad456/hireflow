import { useOutletContext } from "react-router-dom";
import { FileText, MessageCircle, User as UserIcon } from "lucide-react";
import type {
  ApiJobStage,
  JobLayoutOutletContext,
} from "../../pages/JobDetailsLayout";

interface StageComponentProps {
  stage: ApiJobStage;
}

const toTitleCase = (raw: string) =>
  raw
    .replace(/[_-]/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

export function ResumeReviewStage({ stage }: StageComponentProps) {
  const { jobId, refetchJob } = useOutletContext<JobLayoutOutletContext>();

  if (stage.candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 p-5 text-center text-[13px] text-slate-500">
        No applications in this stage yet.
      </div>
    );
  }

  const handleViewCV = (applicationStageId: string) => {
    const candidate = stage.candidates.find(
      (c) => c.applicationStageId === applicationStageId,
    );
    if (candidate?.application?.resumeUrl) {
      window.open(candidate.application.resumeUrl, "_blank");
    }
  };

  const handleAccept = async (applicationStageId: string) => {
    try {
      // await acceptResumeReview(jobId, applicationStageId);
      await refetchJob();
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async (applicationStageId: string) => {
    try {
      // await rejectResumeReview(jobId, applicationStageId);
      await refetchJob();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h3 className="text-sm font-semibold text-gray-900">
        {toTitleCase(stage.name)}
      </h3>

      <div className="mt-2">
        {stage.candidates.map((c) => {
          const name = c.application?.userId?.name ?? "Unknown candidate";
          return (
            <div
              key={c.applicationStageId}
              className="flex flex-col gap-4 border-b border-gray-100 py-6 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Applied{" "}
                  {c.application?.appliedAt
                    ? new Date(c.application.appliedAt).toLocaleDateString(
                        "en-IN",
                      )
                    : "—"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewCV(c.applicationStageId)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <FileText className="h-3.5 w-3.5" /> View CV
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50">
                    <MessageCircle className="h-3.5 w-3.5" /> Chat
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAccept(c.applicationStageId)}
                    className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Accept CV
                  </button>
                  <button
                    onClick={() => handleReject(c.applicationStageId)}
                    className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
                  >
                    Reject CV
                  </button>
                </div>
              </div>

              <div className="flex h-20 w-full items-center justify-center rounded-xl bg-orange-100 sm:h-20 sm:w-32">
                <UserIcon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
