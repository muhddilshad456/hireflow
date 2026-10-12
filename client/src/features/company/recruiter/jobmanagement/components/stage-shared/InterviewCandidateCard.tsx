import React, { useState, useCallback } from "react";
import {
  CandidateAvatarBlock,
  CandidateHeader,
  ScheduleForm,
} from "./InterviewPrimitives";
import type { ApiStageCandidate } from "../../../../../../types/applicaionTypes";
import type { InterviewerInfo } from "../../../../../../types/interview/interview";
import { InterviewerPickerModal } from "../interviewerPickerModal";

export const InterviewCandidateCard: React.FC<{
  candidate: ApiStageCandidate;
  interviewLabel: string;
  scheduleButtonLabel: string;
  onRequestInterview: (
    date: string,
    time: string,
    interviewerId: string,
  ) => Promise<void>;
  fetchInterviewers: () => Promise<InterviewerInfo[]>;
  onChat?: () => void;
}> = ({
  candidate,
  interviewLabel,
  scheduleButtonLabel,
  onRequestInterview,
  fetchInterviewers,
  onChat,
}) => {
  const name = candidate.application?.userId?.name ?? "Unknown candidate";
  const progress = candidate.interviewProgress;
  const status = progress?.status ?? "NOT_REQUESTED";

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleScheduleClick = () => setPickerOpen(true);

  const handleSelectInterviewer = useCallback(
    async (interviewer: InterviewerInfo) => {
      setSubmitting(true);
      try {
        await onRequestInterview(date, time, interviewer._id);
        setPickerOpen(false);
      } finally {
        setSubmitting(false);
      }
    },
    [date, time, onRequestInterview],
  );

  const scheduleSection = (
    <>
      <ScheduleForm
        interviewLabel={interviewLabel}
        submitLabel={scheduleButtonLabel}
        date={date}
        time={time}
        onDateChange={setDate}
        onTimeChange={setTime}
        onSubmit={handleScheduleClick}
        submitting={submitting}
      />
      <InterviewerPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectInterviewer}
        fetchInterviewers={fetchInterviewers}
      />
    </>
  );

  let body: React.ReactNode;

  switch (status) {
    case "REJECTED":
      body = (
        <>
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            Request rejected by {progress?.interviewer?.name ?? "interviewer"}
            {progress?.rejectionReason ? `: ${progress.rejectionReason}` : "."}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Reschedule to send a new request.
          </p>
          {scheduleSection}
        </>
      );
      break;

    case "REQUESTED":
      body = (
        <p className="mt-3 text-xs text-amber-600">
          Requested{" "}
          {progress?.interviewer?.name ? `to ${progress.interviewer.name}` : ""}{" "}
          for{" "}
          {progress?.scheduledAt
            ? new Date(progress.scheduledAt).toLocaleString()
            : "—"}{" "}
          — waiting for interviewer to accept
        </p>
      );
      break;

    case "WAITING_FOR_RESULT":
      body = (
        <p className="mt-3 text-xs text-blue-600">
          Scheduled with {progress?.interviewer?.name ?? "interviewer"} on{" "}
          {progress?.scheduledAt
            ? new Date(progress.scheduledAt).toLocaleString()
            : "—"}{" "}
          — waiting for interview result
        </p>
      );
      break;

    default: // NOT_REQUESTED
      body = <div className="mt-3">{scheduleSection}</div>;
  }

  return (
    <div className="flex flex-col gap-4 border-b border-gray-100 py-6 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <CandidateHeader
          name={name}
          resumeUrl={candidate.application?.resumeUrl}
          onChat={onChat}
        />
        {body}
      </div>
      <CandidateAvatarBlock />
    </div>
  );
};
