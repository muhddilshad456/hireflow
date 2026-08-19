export const AI_MATCH_RESPONSE_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      applicationId: { type: "string" },
      overallScore: { type: "number" },
      verdict: {
        type: "string",
        enum: ["STRONG_MATCH", "GOOD_MATCH", "PARTIAL_MATCH", "NOT_SUITABLE"],
      },
      breakdown: {
        type: "object",
        properties: {
          skillsScore: { type: "number" },
          experienceScore: { type: "number" },
          educationScore: { type: "number" },
          roleRelevanceScore: { type: "number" },
        },
        required: [
          "skillsScore",
          "experienceScore",
          "educationScore",
          "roleRelevanceScore",
        ],
      },
      matchedSkills: { type: "array", items: { type: "string" } },
      missingSkills: { type: "array", items: { type: "string" } },
      reasoning: { type: "string" },
    },
    required: [
      "applicationId",
      "overallScore",
      "verdict",
      "breakdown",
      "matchedSkills",
      "missingSkills",
      "reasoning",
    ],
  },
};
