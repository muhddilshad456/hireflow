// src/types/jobForm.ts — new shared file
import type { JobStageName } from "../../../constents/jobStages";

export interface JobFormData {
  title: string;
  category: string;
  jobType: string;
  location: string;
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
