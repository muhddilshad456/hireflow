import { Types } from "mongoose";
import { MatchVerdict } from "../../constants/ai-filter/ai-responce";

export interface AiMatchResultDto {
  applicationId: string;
  overallScore: number;
  verdict: MatchVerdict;
  breakdown: {
    skillsScore: number;
    experienceScore: number;
    educationScore: number;
    roleRelevanceScore: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
}

export interface RankedCandidateDto extends AiMatchResultDto {
  userId: Types.ObjectId;
  profilePicture?: string;
}
