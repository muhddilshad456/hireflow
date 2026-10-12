import { Types } from "mongoose";
import { IInterviewerProfile } from "../../../models/profiles/interviewer.profile.model";

export class InterviewerProfileMapper {
  static toNewInterviewerProfileEntity(params: {
    userId: Types.ObjectId;
    capabilities: string[];
    bio?: string;
  }): Partial<IInterviewerProfile> {
    return {
      userId: params.userId,
      capabilities: params.capabilities,
      bio: params.bio ?? "",
      isAvailable: true,
      isProfileComplete: this.calculateProfileComplete({
        capabilities: params.capabilities,
        bio: params.bio,
      }),
    };
  }

  static toUpdateInterviewerProfileEntity(params: {
    capabilities: string[];
    bio?: string;
  }): Partial<IInterviewerProfile> {
    return {
      capabilities: params.capabilities,
      bio: params.bio,
      isProfileComplete: this.calculateProfileComplete({
        capabilities: params.capabilities,
        bio: params.bio,
      }),
    };
  }

  private static calculateProfileComplete(params: {
    capabilities: string[];
    bio?: string;
  }): boolean {
    return Boolean(params.capabilities.length > 0 && params.bio?.trim());
  }
}
