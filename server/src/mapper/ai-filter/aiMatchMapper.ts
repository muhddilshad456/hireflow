import {
  CandidateForAiDto,
  JobForAiDto,
} from "../../interfaces/ai-filter/ai-input";
import {
  AiMatchResultDto,
  RankedCandidateDto,
} from "../../interfaces/ai-filter/ai-responce";
import { IJobApplication } from "../../models/job.application.model";
import { IJob } from "../../models/job.model";
import { IUserProfile } from "../../models/user.profile.model";

export class AiMatchMapper {
  static toJobForAi(job: IJob): JobForAiDto {
    return {
      title: job.title,
      description: job.description,
      skillsRequired: job.skills || [],
      experienceMin: job.experienceMin ?? null,
      experienceMax: job.experienceMax ?? null,
      jobType: job.jobType,
      location: job.location,
      category: job.category,
    };
  }
  static toCandidateForAi(
    application: IJobApplication,
    profile: IUserProfile,
  ): CandidateForAiDto {
    const totalExperienceYears = (profile.experience || []).reduce(
      (sum, e) => sum + (e.years || 0),
      0,
    );

    return {
      applicationId: application._id.toString(),
      summary: profile.summary || "",
      skills: profile.skills || [],
      totalExperienceYears,
      experience: (profile.experience || []).map(
        (e) =>
          `${e.title} at ${e.company} (${e.years} yrs): ${e.description ?? ""}`,
      ),
      education: (profile.education || []).map(
        (e) =>
          `${e.degree} in ${e.fieldOfStudy}, ${e.institution} (${e.graduationYear})`,
      ),
      jobPreference: profile.jobPreference
        ? {
            role: profile.jobPreference.role,
            type: profile.jobPreference.type,
            location: profile.jobPreference.location,
            workMode: profile.jobPreference.workMode,
          }
        : undefined,
    };
  }
  static toCandidateListForAi(
    pairs: {
      application: IJobApplication;
      profile: IUserProfile | undefined;
    }[],
  ): CandidateForAiDto[] {
    return pairs
      .filter(
        (p): p is { application: IJobApplication; profile: IUserProfile } =>
          !!p.profile,
      )
      .map((p) => this.toCandidateForAi(p.application, p.profile));
  }
  static toRankedCandidateDto(
    aiResult: AiMatchResultDto,
    application: IJobApplication,
    userName: string,
    userProfilePicture?: string,
  ): RankedCandidateDto {
    return {
      ...aiResult,
      name: userName,
      userId: application.userId,
      profilePicture: userProfilePicture,
    };
  }
}
