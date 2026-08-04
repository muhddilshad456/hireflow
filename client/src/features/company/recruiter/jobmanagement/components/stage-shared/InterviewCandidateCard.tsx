import React, { useState } from "react";
import type { ApiStageCandidate } from "../../pages/JobDetailsLayout";
import {
  CandidateAvatarBlock,
  CandidateHeader,
  PillButton,
  ScheduleForm,
} from "./InterviewPrimitives";

/** Card shown before the interview has happened — request + schedule. */
export const InterviewCandidateCard: React.FC<{
  candidate: ApiStageCandidate;
  interviewLabel: string;
  scheduleButtonLabel: string;
  onRequestInterview: () => Promise<void>;
  onSubmitSchedule: (date: string, time: string) => Promise<void>;
  onChat?: () => void;
}> = ({
  candidate,
  interviewLabel,
  scheduleButtonLabel,
  onRequestInterview,
  onSubmitSchedule,
  onChat,
}) => {
  const name = candidate.application?.userId?.name ?? "Unknown candidate";
  const [date, setDate] = useState(candidate.scheduledDate ?? "");
  const [time, setTime] = useState(candidate.scheduledTime ?? "");
  const [requesting, setRequesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isScheduled = Boolean(
    candidate.scheduledDate && candidate.scheduledTime,
  );

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await onRequestInterview();
    } finally {
      setRequesting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmitSchedule(date, time);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b border-gray-100 py-6 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <CandidateHeader
          name={name}
          resumeUrl={candidate.application?.resumeUrl}
          onChat={onChat}
        />

        {!candidate.interviewRequestedAt ? (
          <div className="mt-3">
            <PillButton onClick={handleRequest} disabled={requesting}>
              Request for interview
            </PillButton>
          </div>
        ) : isScheduled ? (
          <p className="mt-3 text-xs text-gray-500">
            Scheduled for {candidate.scheduledDate} at {candidate.scheduledTime}{" "}
            — awaiting interview result
          </p>
        ) : (
          <>
            <p className="mt-2 text-xs text-emerald-600">Interview requested</p>
            <ScheduleForm
              interviewLabel={interviewLabel}
              submitLabel={scheduleButtonLabel}
              date={date}
              time={time}
              onDateChange={setDate}
              onTimeChange={setTime}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </>
        )}
      </div>

      <CandidateAvatarBlock />
    </div>
  );
};
