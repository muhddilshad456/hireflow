import { inject, injectable } from "inversify";
import { JobDto } from "../../../../../dtos/v1/job/job.dto";
import { IRecruiterService } from "../interface/IRecruiterService";
import { IUserRepository } from "../../../../../repositories/user/interfaces/IUserRepository";
import { TYPES } from "../../../../../dependency-injection/types";
import { JobMapper } from "../../../../../mapper/job/jobMapper";
import { IJobRepository } from "../../../../../repositories/job/interface/IJobRepository";
import { NotFoundError } from "../../../../../errors/not-found.error";
import { BadRequestError } from "../../../../../errors/bad-request.error";
import { InternalServerError } from "../../../../../errors/internal-server.error";
import { Logger } from "pino";
import { IJobStageRepository } from "../../../../../repositories/job/interface/IJobStageRepository";
import {
  JOB_STAGE_NAMES,
  JobStageName,
} from "../../../../../models/job.stage.model";
import { Types } from "mongoose";
import { RECRUITER_MESSAGES } from "../../../../../constants/messages/recruiter";
import { AiMatchMapper } from "../../../../../mapper/ai-filter/aiMatchMapper";
import { RankedCandidateDto } from "../../../../../interfaces/ai-filter/ai-responce";
import { IJobApplicationRepository } from "../../../../../repositories/job-application/interface/IJobApplicationRepository";
import { IUserProfileRepository } from "../../../../../repositories/profile/interface/IUserProfileRepository";
import {
  CandidateForAiDto,
  JobForAiDto,
} from "../../../../../interfaces/ai-filter/ai-input";
import { gemini, LLM_MODEL } from "../../../../../config/gemini";
import { AiMatchResponseSchema } from "../../../../../validators/ai-filter/aiMatchResult.schema";
import { IJobApplicationStageRepository } from "../../../../../repositories/job-application/interface/IJobApplicationStageRepository";
import { AI_MATCH_RESPONSE_SCHEMA } from "../../../../../schemas/geminiResponseSchema";

@injectable()
export class RecruiterService implements IRecruiterService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.JobStageRepository)
    private jobStageRepository: IJobStageRepository,
    @inject(TYPES.JobApplicationStageRepository)
    private jobApplicationStageRepository: IJobApplicationStageRepository,
    @inject(TYPES.JobApplicationRepository)
    private jobApplicationRepository: IJobApplicationRepository,
    @inject(TYPES.UserProfileRepository)
    private userProfileRepository: IUserProfileRepository,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}
  //* helpers
  private buildFullStageList(
    pipelineStages: string[] | undefined,
  ): JobStageName[] {
    const selectedStages = pipelineStages || [];

    const normalizedStages = selectedStages.map((stage) => stage.toLowerCase());

    const invalidStages = normalizedStages.filter(
      (stage) => !JOB_STAGE_NAMES.includes(stage as JobStageName),
    );
    if (invalidStages.length) {
      throw new BadRequestError(
        `Invalid pipeline stage(s): ${invalidStages.join(", ")}`,
      );
    }

    const middleStages = (normalizedStages as JobStageName[]).filter(
      (stage) => stage !== "resume_review" && stage !== "offer",
    );

    return ["resume_review", ...middleStages, "offer"];
  }

  private buildStageDocs(jobId: Types.ObjectId, fullStages: JobStageName[]) {
    return fullStages.map((stage, index) => ({
      jobId,
      type: stage,
      name: stage,
      order: index + 1,
      isMandatory: stage === "resume_review" || stage === "offer",
    }));
  }
  //* helpers of ai ranking
  private estimateMaxTokens(candidateCount: number): number {
    return Math.min(8192, Math.max(1024, candidateCount * 180));
  }

  private buildAiSystemPrompt(): string {
    return `You are a recruitment screening assistant.
You will be given ONE job requirement and a LIST of candidates.
Score every candidate independently against the job — do not compare candidates to each other, do not let one candidate's score influence another's.

Rules:
- Do NOT consider name, gender, age, or any personal identity signals.
- Be strict but fair. Do not inflate scores. A candidate missing several required skills should score lower.
- skillsScore: based on % of required skills present, and relevance of extra skills the candidate has.
- experienceScore: based on whether totalExperienceYears falls within experienceMin-experienceMax. Penalize being under the minimum more heavily than being over the maximum.
- educationScore: based on relevance of degree/field to the job category, not exact string matching.
- roleRelevanceScore: based on how well past job titles/domains align with this job's title and category.
- overallScore is a weighted combination of the four sub-scores (skills and experience weighted highest).
- You MUST return exactly one result object per candidate in the input list, using the same applicationId given to you.
- If the candidate list is empty, return an empty array.

Return ONLY a valid JSON array, no markdown formatting, no code fences, no commentary before or after. Each element must match exactly:
{
  "applicationId": string (copy exactly from the input candidate),
  "overallScore": number (0-100),
  "verdict": "STRONG_MATCH" | "GOOD_MATCH" | "PARTIAL_MATCH" | "NOT_SUITABLE",
  "breakdown": {
    "skillsScore": number (0-100),
    "experienceScore": number (0-100),
    "educationScore": number (0-100),
    "roleRelevanceScore": number (0-100)
  },
  "matchedSkills": string[],
  "missingSkills": string[],
  "reasoning": string (2-3 sentences, specific and factual)
}`;
  }

  private buildAiUserPrompt(
    job: JobForAiDto,
    candidates: CandidateForAiDto[],
  ): string {
    return `JOB REQUIREMENT:
${JSON.stringify(job, null, 2)}

CANDIDATES (${candidates.length} total):
${JSON.stringify(candidates, null, 2)}

Evaluate every candidate above against the job requirement and return the JSON array.`;
  }

  private async callAiForBatch(
    job: JobForAiDto,
    candidates: CandidateForAiDto[],
    maxRetries = 2,
  ) {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await gemini.models.generateContent({
          model: LLM_MODEL,
          contents: [
            {
              role: "user",
              parts: [{ text: this.buildAiUserPrompt(job, candidates) }],
            },
          ],
          config: {
            systemInstruction: this.buildAiSystemPrompt(),
            responseMimeType: "application/json",
            responseSchema: AI_MATCH_RESPONSE_SCHEMA,
            maxOutputTokens: this.estimateMaxTokens(candidates.length),
          },
        });

        const rawText = response.text;
        if (!rawText) {
          throw new Error("AI response contained no text");
        }

        const parsed = JSON.parse(rawText);
        const result = AiMatchResponseSchema.safeParse(parsed);

        if (!result.success) {
          throw new Error(
            `AI response failed schema validation: ${JSON.stringify(result.error.issues)}`,
          );
        }

        if (result.data.length !== candidates.length) {
          throw new Error(
            `AI returned ${result.data.length} results for ${candidates.length} candidates`,
          );
        }

        return result.data;
      } catch (err: any) {
        lastError = err;

        if (err?.status === 429 || err?.error?.code === 429) {
          const retryAfterSeconds = 5;
          if (attempt === maxRetries) {
            this.logger.warn({
              event: "AI rate limit reached after retries",
              retryAfterSeconds,
            });
            throw new BadRequestError(
              `AI filtering is temporarily busy. Please try again in ${retryAfterSeconds}s.`,
            );
          }
          await new Promise((r) => setTimeout(r, retryAfterSeconds * 1000));
          continue;
        }

        if (attempt < maxRetries) {
          this.logger.warn({
            event: "AI batch call failed, retrying",
            attempt,
            error: err?.message,
          });
          continue;
        }
      }
    }

    this.logger.error({
      event: "AI batch scoring failed after all retries",
      error: (lastError as Error)?.message,
    });
    throw new InternalServerError("Failed to score candidates using AI");
  }

  //* create a job
  async createJob(dto: JobDto, recruiterId: string): Promise<any> {
    this.logger.info({
      event: "Job creation started",
    });

    const recruiter = await this.userRepository.findById(recruiterId);

    if (!recruiter) {
      this.logger.warn({
        event: "Recruiter not found",
      });
      throw new NotFoundError("Recruiter not found");
    }

    if (!recruiter.company) {
      this.logger.warn({
        event: RECRUITER_MESSAGES.RECRUITER_NOT_ASSOSIATED_WITH_THIS_COMPANY,
      });
      throw new BadRequestError(
        RECRUITER_MESSAGES.RECRUITER_NOT_ASSOSIATED_WITH_THIS_COMPANY,
      );
    }

    const companyId = recruiter.company;

    const data = JobMapper.toJobEntity(dto, recruiter._id, companyId);

    const result = await this.jobRepository.create(data);

    if (!result) {
      this.logger.warn({
        event: "Failed to create job",
      });
      throw new InternalServerError("Failed to create job");
    }

    this.logger.info({
      event: "Job created successfully",
    });

    const fullStages = this.buildFullStageList(dto.pipelineStages);

    this.logger.info({
      event: "Final pipeline stages prepared (with mandatory stage)",
      data: fullStages,
    });

    const stageDocs = this.buildStageDocs(result._id, fullStages);

    this.logger.info({
      event: "Stage documents constructed",
      count: stageDocs.length,
      preview: stageDocs.map((s) => ({
        name: s.name,
        order: s.order,
        isMandatory: s.isMandatory,
      })),
    });

    const createdStages = await this.jobStageRepository.createMany(stageDocs);

    if (!createdStages) {
      this.logger.error({
        event: "Failed to create job stages",
        jobId: result._id,
      });

      throw new InternalServerError("Failed to create job stages");
    }

    this.logger.info({
      event: "Job stages created successfully",
      jobId: result._id,
      totalStages: createdStages.length,
    });

    return result;
  }

  //* update job
  async updateJob(
    jobId: string,
    dto: JobDto,
    recruiterId: string,
  ): Promise<any> {
    this.logger.info({ event: "Job update started", jobId });

    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      this.logger.warn({ event: "Job not found", jobId });
      throw new NotFoundError("Job not found");
    }

    if (job.createdBy.toString() !== recruiterId) {
      this.logger.warn({
        event: RECRUITER_MESSAGES.CANT_EDIT_THE_JOB_THAT_YOU_DONT_OWN,
        jobId,
        recruiterId,
      });
      throw new BadRequestError(
        RECRUITER_MESSAGES.CANT_EDIT_THE_JOB_THAT_YOU_DONT_OWN,
      );
    }

    const stagesLocked = job.applicantsCount > 0;

    this.logger.info({
      event: "Stage lock status determined",
      jobId,
      applicantsCount: job.applicantsCount,
      stagesLocked,
    });

    const updateData = JobMapper.toJobUpdateEntity(dto);

    const updatedJob = await this.jobRepository.update(jobId, updateData);

    if (!updatedJob) {
      this.logger.error({ event: "Failed to update job", jobId });
      throw new InternalServerError("Failed to update job");
    }

    this.logger.info({ event: "Job fields updated successfully", jobId });

    if (stagesLocked) {
      this.logger.info({
        event: "Skipping stage update — job has applicants, stages are locked",
        jobId,
      });
      return updatedJob;
    }

    const fullStages = this.buildFullStageList(dto.pipelineStages);

    this.logger.info({
      event: "Final pipeline stages prepared for update",
      jobId,
      data: fullStages,
    });

    const deleteResult = await this.jobStageRepository.deleteMany({
      jobId: job._id,
    });

    this.logger.info({
      event: "Existing stages deleted",
      jobId,
      deletedCount: deleteResult?.deletedCount ?? 0,
    });

    const stageDocs = this.buildStageDocs(job._id, fullStages);

    const createdStages = await this.jobStageRepository.createMany(stageDocs);

    if (!createdStages) {
      this.logger.error({
        event: "Failed to recreate job stages",
        jobId,
      });
      throw new InternalServerError("Failed to update job stages");
    }

    this.logger.info({
      event: "Job stages recreated successfully",
      jobId,
      totalStages: createdStages.length,
    });

    return updatedJob;
  }
  //* filter candidates using AI
  async aiFilterCandidates(jobId: string): Promise<RankedCandidateDto[]> {
    this.logger.info({ event: "AI candidate filtering started", jobId });

    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      this.logger.warn({ event: "Job not found", jobId });
      throw new NotFoundError("Job not found");
    }

    const resumeReviewStage = await this.jobStageRepository.findOne({
      jobId: job._id,
      name: "resume_review",
    });

    if (!resumeReviewStage) {
      this.logger.error({
        event: "Resume review stage missing for job",
        jobId,
      });
      throw new InternalServerError(
        "Resume review stage not configured for this job",
      );
    }
    const resumeReviewApplicationStages =
      await this.jobApplicationStageRepository.find({
        jobStageId: resumeReviewStage._id,
      });

    if (resumeReviewApplicationStages.length === 0) {
      this.logger.info({
        event: "No application-stage instances found for resume review",
        jobId,
      });
      return [];
    }

    const resumeReviewApplicationStageIds = resumeReviewApplicationStages.map(
      (s) => s._id,
    );

    const applications = await this.jobApplicationRepository.find({
      jobId: job._id,
      currentStageId: { $in: resumeReviewApplicationStageIds },
    });

    this.logger.info({
      event: "Resume review applications fetched",
      jobId,
      count: applications.length,
    });

    if (applications.length === 0) {
      return [];
    }

    const userIds = applications.map((a) => a.userId);

    const [profiles, users] = await Promise.all([
      this.userProfileRepository.find({ userId: { $in: userIds } }),
      this.userRepository.find({ _id: { $in: userIds } }),
    ]);

    const profileByUserId = new Map(
      profiles.map((p) => [p.userId.toString(), p]),
    );
    const nameByUserId = new Map(users.map((u) => [u._id.toString(), u]));

    const pairs = applications.map((application) => ({
      application,
      profile: profileByUserId.get(application.userId.toString()),
    }));

    const jobForAi = AiMatchMapper.toJobForAi(job);
    const candidatesForAi = AiMatchMapper.toCandidateListForAi(pairs);

    if (candidatesForAi.length === 0) {
      this.logger.warn({
        event: "No candidates had profiles to score",
        jobId,
      });
      return [];
    }

    this.logger.info({
      event: "Calling AI for batch scoring",
      jobId,
      candidateCount: candidatesForAi.length,
    });

    const aiResults = await this.callAiForBatch(jobForAi, candidatesForAi);

    const applicationById = new Map(
      applications.map((a) => [a._id.toString(), a]),
    );

    const ranked: RankedCandidateDto[] = aiResults.map((result) => {
      const application = applicationById.get(result.applicationId)!;
      const user = nameByUserId.get(application.userId.toString());
      return AiMatchMapper.toRankedCandidateDto(
        result,
        application,
        user?.name ?? "Unknown",
        user?.profilePicture,
      );
    });

    ranked.sort((a, b) => b.overallScore - a.overallScore);

    this.logger.info({
      event: "AI candidate filtering completed",
      jobId,
      rankedCount: ranked.length,
    });

    return ranked;
  }
}
