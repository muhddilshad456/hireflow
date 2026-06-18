//* job
export interface Job {
  _id: string;
  title: string;
  company: { _id: string; companyName: string };
  location: string;
  salary: string;
  isActive: boolean;
  jobType: JobType;
}
//* job type
export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERNSHIP"
  | "CONTRACT"
  | "";
//* job filter type
export interface JobFilters {
  search?: string;
  location?: string;
  jobType?: JobType[];
  salaryMin?: string;
  salaryMax?: string;
  experienceMax?: string;
  experienceMin?: string;
  category?: string[];
  skills?: string[];
  status?: string;
  page?: number;
  limit?: number;
}
//* job categories
export const CATEGORIES = [
  "IT",
  "MARKETING",
  "FINANCE",
  "HR",
  "SALES",
  "OTHER",
] as const;
//* skills
export const ALL_SKILLS = [
  "Java",
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "AWS",
  "Docker",
  "SQL",
];
