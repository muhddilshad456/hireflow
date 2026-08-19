// src/constants/jobStages.ts
export const JOB_STAGE_NAMES = [
  "resume_review",
  "assessment",
  "document_verification",
  "hr_interview",
  "technical_interview",
  "final_hr_interview",
  "offer",
] as const;

export type JobStageName = (typeof JOB_STAGE_NAMES)[number];

// Stages that are system-managed and never appear in the "optional stages" picker
export const MANDATORY_STAGE_NAMES: JobStageName[] = ["resume_review", "offer"];

// Only the ones a recruiter can toggle on/off and reorder
export const OPTIONAL_STAGE_NAMES = JOB_STAGE_NAMES.filter(
  (s) => !MANDATORY_STAGE_NAMES.includes(s),
) as Exclude<JobStageName, "resume_review" | "offer">[];

export const STAGE_LABELS: Record<JobStageName, string> = {
  resume_review: "Resume Review",
  assessment: "Assessment",
  document_verification: "Document Verification",
  hr_interview: "HR Interview",
  technical_interview: "Technical Interview",
  final_hr_interview: "Final HR Interview",
  offer: "Offer",
};
