export const APPLICATION_MESSAGES = {
  APPLICATION_SUBMITTED: "Application submitted successfully",
  APPLICATION_FAILED: "Failed to submit application",

  APPLICATION_NOT_FOUND: "Application not found",
  APPLICATION_ALREADY_EXISTS: "You have already applied for this job",

  APPLICATION_IN_PROGRESS: "Application is in progress",
  APPLICATION_REJECTED: "Application rejected",
  APPLICATION_SELECTED: "Application selected",
  APPLICATION_OFFER_SENT: "Offer has been sent",
  APPLICATION_ACCEPTED: "Offer accepted",
  APPLICATION_DECLINED: "Offer declined",

  INVALID_APPLICATION_ID: "Invalid application ID",
  JOB_ID_REQUIRED: "Job ID is required",
  RESUME_REQUIRED: "Resume is required to apply",
  COVER_LETTER_REQUIRED: "Cover letter is required",

  STAGE_NOT_FOUND: "Application stage not found",
  STAGE_UPDATE_FAILED: "Failed to update application stage",
  STAGE_UPDATE_SUCCESSFULLY: "Application stage updated successfully.",
  APPLICATION_ALREADY_FINALIZED: "Application has already been finalized",
  NO_STAGES_CONFIGURED: "No active stages configured for this job",
  STAGE_MISMATCH: "Current stage not found in job's active stage list",
  STAGE_FAILED: "Cannot advance: candidate already failed this stage",
  STAGE_ALREADY_STARTED: "Next stage has already been started",
  OFFER_STAGE_MANUAL_ONLY:
    "Offer stage must be resolved via the offer-response endpoint",
  ALL_STAGES_COMPLETED: "Candidate has completed all stages",
  MOVED_TO_NEXT_STAGE: "Candidate moved to next stage",
  CURRENT_STAGE_RECORD_MISSING:
    "Current application stage record not found — data integrity issue",
};
