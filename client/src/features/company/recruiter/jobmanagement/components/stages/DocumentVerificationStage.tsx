import { useOutletContext } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";
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

export function DocumentVerificationStage({ stage }: StageComponentProps) {
  const { jobId, refetchJob } = useOutletContext<JobLayoutOutletContext>();

  const handleVerify = async (applicationStageId: string) => {
    try {
      // await verifyDocument(jobId, applicationStageId);
      await refetchJob();
    } catch (err) {
      console.log(err);
    }
  };

  const handleFlag = async (applicationStageId: string) => {
    try {
      // await flagDocument(jobId, applicationStageId);
      await refetchJob();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-bold text-slate-900">
        {toTitleCase(stage.name)}
      </h3>

      {stage.candidates.length === 0 ? (
        <p className="mt-2 text-[13px] text-slate-500">
          No candidates to verify yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {stage.candidates.map((c) => (
            <div
              key={c.applicationStageId}
              className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                {c.status === "PASSED" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  {c.application?.userId?.name ?? "—"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerify(c.applicationStageId)}
                  className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleFlag(c.applicationStageId)}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                >
                  Flag
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
