import { useOutletContext } from "react-router-dom";
import { InterviewCandidateCard } from "../stage-shared/InterviewCandidateCard";
import { FinalResultCard } from "../stage-shared/FinalResultCard";
import type { JobLayoutOutletContext } from "../../pages/JobDetailsLayout";
import type { ApiStageCandidate } from "../../../../../../types/applicaionTypes.ts";
import { InterviewResultCard } from "../stage-shared/InterviewResultCard.tsx.tsx";
import type { StageDetail } from "../StageRenderer.tsx";
import { requestForInterview } from "../../services/interviewServices.tsx";
import toast from "react-hot-toast";

interface InterviewStageConfig {
  title: string;
  interviewLabel: string;
  scheduleButtonLabel: string;
  resultTitle?: string;
  feedbackLabel: string;
}

export function createInterviewStage(config: InterviewStageConfig) {
  return function InterviewStage({ stage }: { stage: StageDetail }) {
    const { jobId, refetchJob } = useOutletContext<JobLayoutOutletContext>();

    if (stage.candidates.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-100 p-5 text-center text-[13px] text-slate-500">
          No candidates in {config.title.toLowerCase()} yet.
        </div>
      );
    }

    const handleRequestInterview = async (
      c: ApiStageCandidate,
      date: string,
      time: string,
      interviewerId: string,
    ) => {
      try {
        const scheduledAt = new Date(`${date}T${time}`).toISOString();

        await requestForInterview({
          jobApplicationStageId: c.applicationStageId,
          interviewerId,
          scheduledAt,
        });
        toast.success("Interview request created successfully.");
        await refetchJob();
      } catch (err: any) {
        console.log(err?.response);
        toast.error(err?.response?.data?.message);
      }
    };

    const handleSubmitResult = async (
      c: ApiStageCandidate,
      result: "PASS" | "FAIL",
      feedback: string,
    ) => {
      try {
        // await submitInterviewResult(jobId, c.applicationStageId, {
        //   status: result === "PASS" ? "PASSED" : "FAILED",
        //   feedback,
        // });
        await refetchJob();
      } catch (err) {
        console.log(err);
      }
    };

    return (
      <>
        <h3 className="text-sm font-semibold text-gray-900">{config.title}</h3>

        <div className="mt-2 space-y-4">
          {stage.candidates.map((c) => {
            const isDecided = c.status === "PASSED" || c.status === "FAILED";
            const progressStatus =
              c.interviewProgress?.status ?? "NOT_REQUESTED";

            if (isDecided) {
              return (
                <FinalResultCard key={c.applicationStageId} candidate={c} />
              );
            }

            if (progressStatus === "COMPLETED") {
              return (
                <InterviewResultCard
                  key={c.applicationStageId}
                  candidate={c}
                  title={config.resultTitle ?? `${config.title} Results`}
                  feedbackLabel={config.feedbackLabel}
                  onSubmitResult={(result, feedback) =>
                    handleSubmitResult(c, result, feedback)
                  }
                />
              );
            }

            return (
              <InterviewCandidateCard
                key={c.applicationStageId}
                candidate={c}
                interviewLabel={config.interviewLabel}
                scheduleButtonLabel={config.scheduleButtonLabel}
                onRequestInterview={(date, time, interviewerId) =>
                  handleRequestInterview(c, date, time, interviewerId)
                }
                fetchInterviewers={() => fetchInterviewersStub(jobId)}
              />
            );
          })}
        </div>
      </>
    );
  };
}

// placeholder until you wire the real endpoint
async function fetchInterviewersStub(jobId: string) {
  return [];
}
