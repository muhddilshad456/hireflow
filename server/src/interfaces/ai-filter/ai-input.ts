export interface JobForAiDto {
  title: string;
  description: string;
  skillsRequired: string[];
  experienceMin: number | null;
  experienceMax: number | null;
  jobType: string;
  location: string;
  category: string;
}

export interface CandidateForAiDto {
  applicationId: string;
  summary: string;
  skills: string[];
  totalExperienceYears: number;
  experience: string[];
  education: string[];
  jobPreference?: {
    role: string;
    type: string;
    location: string;
    workMode: string;
  };
}
