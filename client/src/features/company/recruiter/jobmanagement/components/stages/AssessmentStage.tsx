import { useOutletContext } from "react-router-dom";
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

export function AssessmentStage({ stage }: StageComponentProps) {
  const { jobId, refetchJob } = useOutletContext<JobLayoutOutletContext>();

  const handlePass = async (applicationStageId: string) => {
    try {
      // await passAssessment(jobId, applicationStageId);
      await refetchJob();
    } catch (err) {
      console.log(err);
    }
  };

  const handleFail = async (applicationStageId: string) => {
    try {
      // await failAssessment(jobId, applicationStageId);
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
          No candidates in the assessment stage.
        </p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400">
              <th className="pb-2 font-medium">Candidate</th>
              <th className="pb-2 font-medium">Notes</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {stage.candidates.map((c) => (
              <tr
                key={c.applicationStageId}
                className="border-b border-gray-50"
              >
                <td className="py-3 font-medium text-gray-900">
                  {c.application?.userId?.name ?? "—"}
                </td>
                <td className="py-3 text-gray-500">
                  {c.feedback ?? "Pending"}
                </td>
                <td className="py-3 text-gray-500">{c.status}</td>
                <td className="py-3">
                  <button
                    onClick={() => handlePass(c.applicationStageId)}
                    className="mr-2 text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => handleFail(c.applicationStageId)}
                    className="text-xs font-semibold text-gray-500 hover:underline"
                  >
                    Fail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
