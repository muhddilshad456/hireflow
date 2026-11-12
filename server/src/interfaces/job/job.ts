import { Types } from "mongoose";

export interface IJobWithFavorite {
  _id: Types.ObjectId;
  company: Types.ObjectId;
  createdBy: Types.ObjectId;
  title: string;
  description: string;
  location: string;
  jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  experienceMin?: number;
  experienceMax?: number;
  category: string;
  status: "OPEN" | "CLOSED";
  applicationDeadline?: Date;
  positions: number;
  applicantsCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
}
