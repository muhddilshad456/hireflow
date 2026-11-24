import { useOutletContext } from "react-router-dom";
import { InterviewCandidateCard } from "../stage-shared/InterviewCandidateCard";
import { FinalResultCard } from "../stage-shared/FinalResultCard";
import type { JobLayoutOutletContext } from "../../pages/JobDetailsLayout";
import type { ApiStageCandidate } from "../../../../../../types/applicaionTypes.ts";
import { InterviewResultCard } from "../stage-shared/InterviewResultCard.tsx.tsx";
import type { StageDetail } from "../StageRenderer.tsx";
import { requestForInterview } from "../../services/interviewServices.tsx";
import toast from "react-hot-toast";
import { updateJobApplicationStage } from "../../services/jobServices.tsx";
import { ApplicationStatusBadge } from "../../../shared/components/ApplicationStatusBadge.tsx";

interface InterviewStageConfig {
  title: string;
  interviewLabel: string;
  scheduleButtonLabel: string;
  resultTitle?: string;
  feedbackLabel: string;
}

export function createInterviewStage(config: InterviewStageConfig) {
  return function InterviewStage({ stage }: { stage: StageDetail }) {
    const { refetchJob } = useOutletContext<JobLayoutOutletContext>();

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
          jobApplicationStageId: c.applicationStage._id,
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
      const decision = result == "PASS" ? "PASSED" : "FAILED";
      try {
        await updateJobApplicationStage(
          c?.applicationStage?._id,
          decision,
          feedback,
        );
        toast.success("Result updated");
        await refetchJob();
      } catch (err: any) {
        console.log(err?.response);
        toast.error(err?.response?.data?.message);
      }
    };

    return (
      <>
        <h3 className="text-sm font-semibold text-gray-900">{config.title}</h3>

        <div className="mt-2 space-y-4">
          {stage.candidates.map((c) => {
            if (!c.application) return null;
            const isDecided = c.status === "PASSED" || c.status === "FAILED";
            const progressStatus =
              c?.applicationStage?.interviewProgress?.status ?? "NOT_REQUESTED";
            const interviewRequest = c.applicationStage?.interviewRequest;

            return (
              <div
                key={c.applicationStage._id}
                className="rounded-xl border border-gray-100 p-4"
              >
                {/* Application Status - Top Right */}
                <div className="mb-4 flex justify-end">
                  <ApplicationStatusBadge status={c.application.status} />
                </div>

                {isDecided ? (
                  <>
                    <InterviewCandidateCard
                      candidate={c}
                      interviewLabel={config.interviewLabel}
                      scheduleButtonLabel={config.scheduleButtonLabel}
                      onRequestInterview={(date, time, interviewerId) =>
                        handleRequestInterview(c, date, time, interviewerId)
                      }
                      fetchInterviewers={() => fetchInterviewersStub()}
                      hideSchedule
                    />
                    <FinalResultCard candidate={c} />
                  </>
                ) : progressStatus === "COMPLETED" ? (
                  <>
                    <InterviewCandidateCard
                      candidate={c}
                      interviewLabel={config.interviewLabel}
                      scheduleButtonLabel={config.scheduleButtonLabel}
                      onRequestInterview={(date, time, interviewerId) =>
                        handleRequestInterview(c, date, time, interviewerId)
                      }
                      fetchInterviewers={() => fetchInterviewersStub()}
                      hideSchedule
                    />
                    <InterviewResultCard
                      candidate={c}
                      title={config.resultTitle ?? `${config.title} Results`}
                      feedbackLabel={config.feedbackLabel}
                      onSubmitResult={(result, feedback) =>
                        handleSubmitResult(c, result, feedback)
                      }
                    />
                  </>
                ) : interviewRequest?.status === "ACCEPTED" ? (
                  <>
                    <InterviewCandidateCard
                      candidate={c}
                      interviewLabel={config.interviewLabel}
                      scheduleButtonLabel={config.scheduleButtonLabel}
                      onRequestInterview={(date, time, interviewerId) =>
                        handleRequestInterview(c, date, time, interviewerId)
                      }
                      fetchInterviewers={() => fetchInterviewersStub()}
                      hideSchedule
                    />
                    <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 text-sm">
                      <p className="font-semibold text-green-700">
                        Interview accepted
                      </p>
                      <p className="mt-1 text-gray-600">
                        Accepted by{" "}
                        {interviewRequest.interviewerId?.name ?? "Interviewer"}
                      </p>
                      <p className="mt-1 text-gray-600">
                        Scheduled for{" "}
                        {new Date(
                          interviewRequest.scheduledAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : interviewRequest?.status === "REJECTED" ? (
                  <>
                    <InterviewCandidateCard
                      candidate={c}
                      interviewLabel={config.interviewLabel}
                      scheduleButtonLabel={config.scheduleButtonLabel}
                      onRequestInterview={(date, time, interviewerId) =>
                        handleRequestInterview(c, date, time, interviewerId)
                      }
                      fetchInterviewers={() => fetchInterviewersStub()}
                      hideSchedule
                    />
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-700">
                        Latest request rejected
                      </span>
                      <span className="text-gray-500">
                        By{" "}
                        {interviewRequest.interviewerId?.name ?? "Interviewer"}
                        {interviewRequest.rejectionReason &&
                          ` · ${interviewRequest.rejectionReason}`}
                      </span>
                    </div>
                    <InterviewCandidateCard
                      candidate={c}
                      interviewLabel={config.interviewLabel}
                      scheduleButtonLabel={config.scheduleButtonLabel}
                      onRequestInterview={(date, time, interviewerId) =>
                        handleRequestInterview(c, date, time, interviewerId)
                      }
                      fetchInterviewers={() => fetchInterviewersStub()}
                    />
                  </>
                ) : (
                  <InterviewCandidateCard
                    candidate={c}
                    interviewLabel={config.interviewLabel}
                    scheduleButtonLabel={config.scheduleButtonLabel}
                    onRequestInterview={(date, time, interviewerId) =>
                      handleRequestInterview(c, date, time, interviewerId)
                    }
                    fetchInterviewers={() => fetchInterviewersStub()}
                  />
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };
}

// placeholder until you wire the real endpoint
async function fetchInterviewersStub() {
  return [];
}
