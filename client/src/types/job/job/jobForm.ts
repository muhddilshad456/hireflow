// src/types/jobForm.ts — new shared file
import type { JobStageName } from "../../../constents/jobStages";

export type WorkMode = "ONSITE" | "REMOTE" | "HYBRID";

export interface JobFormData {
  title: string;
  category: string;
  jobType: string;
  workMode: WorkMode;
  location: string;
  locationCoordinates: {
    type: "Point";
    coordinates: [number, number];
  } | null;
  description: string;
  minSalary: string;
  maxSalary: string;
  salaryNotDisclosed: boolean;
  skills: string[];
  minExperience: string;
  maxExperience: string;
  fresherOk: boolean;
  positions: string;
  applicationDeadline: string;
  pipelineStages: JobStageName[];
}
