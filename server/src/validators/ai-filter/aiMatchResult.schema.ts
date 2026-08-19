import { z } from "zod";

export const AiMatchResultSchema = z.object({
  applicationId: z.string(),
  overallScore: z.number().min(0).max(100),
  verdict: z.enum([
    "STRONG_MATCH",
    "GOOD_MATCH",
    "PARTIAL_MATCH",
    "NOT_SUITABLE",
  ]),
  breakdown: z.object({
    skillsScore: z.number().min(0).max(100),
    experienceScore: z.number().min(0).max(100),
    educationScore: z.number().min(0).max(100),
    roleRelevanceScore: z.number().min(0).max(100),
  }),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  reasoning: z.string(),
});

export const AiMatchResponseSchema = z.array(AiMatchResultSchema);

export type AiMatchResult = z.infer<typeof AiMatchResultSchema>;
