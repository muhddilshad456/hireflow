import { useOutletContext } from "react-router-dom";

import { InterviewCandidateCard } from "../stage-shared/InterviewCandidateCard";
import { InterviewResultCard } from "../stage-shared/InterviewResultCard.tsx";
import type {
  ApiJobStage,
  ApiStageCandidate,
  JobLayoutOutletContext,
} from "../../pages/JobDetailsLayout.tsx";
// import your real service calls, e.g.:
// import { requestInterview, scheduleInterview, submitInterviewResult } from "../../services/interviewServices";

interface InterviewStageConfig {
  title: string;
  interviewLabel: string; // "Video call interview" | "Online interview"
  scheduleButtonLabel: string; // "Submit Schedule" | "Schedule"
  resultTitle?: string; // e.g. "Technical Round Results" — omit to reuse `title`
  feedbackLabel: string; // "HR Feedback" | "Feedback"
}

export function createInterviewStage(config: InterviewStageConfig) {
  return function InterviewStage({ stage }: { stage: ApiJobStage }) {
    const { jobId, refetchJob } = useOutletContext<JobLayoutOutletContext>();

    if (stage.candidates.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-100 p-5 text-center text-[13px] text-slate-500">
          No candidates in {config.title.toLowerCase()} yet.
        </div>
      );
    }

    const handleRequestInterview = async (c: ApiStageCandidate) => {
      try {
        // await requestInterview(jobId, c.applicationStageId);
        await refetchJob();
      } catch (err) {
        console.log(err);
      }
    };

    const handleSubmitSchedule = async (
      c: ApiStageCandidate,
      date: string,
      time: string,
    ) => {
      try {
        // await scheduleInterview(jobId, c.applicationStageId, { date, time });
        await refetchJob();
      } catch (err) {
        console.log(err);
      }
    };

    const handleSubmitResult = async (
      c: ApiStageCandidate,
      result: "PASS" | "FAIL",
      feedback: string,
    ) => {
      try {
        // await submitInterviewResult(jobId, c.applicationStageId, { result, feedback });
        await refetchJob(); // candidate moves to next stage (or is rejected) on refetch
      } catch (err) {
        console.log(err);
      }
    };

    return (
      <>
        <h3 className="text-sm font-semibold text-gray-900">{config.title}</h3>

        <div className="mt-2 space-y-4">
          {stage.candidates.map((c) =>
            c.interviewerCompletedAt ? (
              <InterviewResultCard
                key={c.applicationStageId}
                candidate={c}
                title={config.resultTitle ?? `${config.title} Results`}
                feedbackLabel={config.feedbackLabel}
                onSubmitResult={(result, feedback) =>
                  handleSubmitResult(c, result, feedback)
                }
              />
            ) : (
              <InterviewCandidateCard
                key={c.applicationStageId}
                candidate={c}
                interviewLabel={config.interviewLabel}
                scheduleButtonLabel={config.scheduleButtonLabel}
                onRequestInterview={() => handleRequestInterview(c)}
                onSubmitSchedule={(date, time) =>
                  handleSubmitSchedule(c, date, time)
                }
              />
            ),
          )}
        </div>
      </>
    );
  };
}
