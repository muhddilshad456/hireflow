import { ProfileArrayField } from "../../constants/profile/profile.constents";

export interface EducationInput {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: number;
}

export interface ExperienceInput {
  title: string;
  company: string;
  years: number;
  description?: string;
}

export interface CoverLetterInput {
  title: string;
  content: string;
}

export interface ProfileItemInputMap {
  [ProfileArrayField.EDUCATION]: EducationInput;
  [ProfileArrayField.EXPERIENCE]: ExperienceInput;
  [ProfileArrayField.COVER_LETTERS]: CoverLetterInput;
}

export type SupportedProfileArrayField = keyof ProfileItemInputMap;

export type ProfileItemUpdateMap = {
  [ProfileArrayField.EDUCATION]: Partial<EducationInput>;
  [ProfileArrayField.EXPERIENCE]: Partial<ExperienceInput>;
  [ProfileArrayField.COVER_LETTERS]: Partial<CoverLetterInput>;
};
