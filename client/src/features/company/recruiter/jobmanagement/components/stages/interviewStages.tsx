import { createInterviewStage } from "./createInterviewStages";

export const HRRoundStage = createInterviewStage({
  title: "HR Round",
  interviewLabel: "Video call interview",
  scheduleButtonLabel: "Submit Schedule",
  feedbackLabel: "HR Feedback",
});

export const TechnicalRoundStage = createInterviewStage({
  title: "Technical Round",
  interviewLabel: "Online interview",
  scheduleButtonLabel: "Schedule",
  resultTitle: "Technical Round Results",
  feedbackLabel: "Feedback",
});

export const FinalHRStage = createInterviewStage({
  title: "Final HR",
  interviewLabel: "Video call interview",
  scheduleButtonLabel: "Submit Schedule",
  feedbackLabel: "Feedback",
});
