import { ProfileArrayField } from "../../constants/profile/profile.constents";
import { BadRequestError } from "../../errors/bad-request.error";

export class ProfileMapper {
  static toArrayItemEntity(field: ProfileArrayField, data: any) {
    switch (field) {
      case ProfileArrayField.EDUCATION:
        return this.toEducationEntity(data);
      case ProfileArrayField.EXPERIENCE:
        return this.toExperienceEntity(data);
      case ProfileArrayField.COVER_LETTERS:
        return this.toCoverLetterEntity(data);
      default:
        throw new BadRequestError(`Unsupported field: ${field}`);
    }
  }

  private static toEducationEntity(data: any) {
    const { degree, fieldOfStudy, institution, graduationYear } = data ?? {};

    if (!degree || !institution) {
      throw new BadRequestError("Degree and institution are required");
    }

    return {
      degree,
      fieldOfStudy,
      institution,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
    };
  }

  private static toExperienceEntity(data: any) {
    const { title, company, years, description } = data ?? {};

    if (!title || !company) {
      throw new BadRequestError("Title and company are required");
    }

    return {
      title,
      company,
      years: years !== undefined ? Number(years) : undefined,
      description,
    };
  }

  private static toCoverLetterEntity(data: any) {
    const { title, content } = data ?? {};

    if (!title || !content) {
      throw new BadRequestError("Title and content are required");
    }

    return {
      title,
      content,
      createdAt: new Date(),
    };
  }

  static toArrayItemUpdate(field: ProfileArrayField, data: any) {
    switch (field) {
      case ProfileArrayField.EDUCATION:
        return this.toEducationUpdate(data);
      case ProfileArrayField.EXPERIENCE:
        return this.toExperienceUpdate(data);
      case ProfileArrayField.COVER_LETTERS:
        return this.toCoverLetterUpdate(data);
      default:
        throw new BadRequestError(`Unsupported field: ${field}`);
    }
  }

  private static toEducationUpdate(data: any) {
    const allowed = ["degree", "fieldOfStudy", "institution", "graduationYear"];
    const update: Record<string, any> = {};

    for (const key of allowed) {
      if (data?.[key] !== undefined) {
        update[key] = key === "graduationYear" ? Number(data[key]) : data[key];
      }
    }
    return update;
  }

  private static toExperienceUpdate(data: any) {
    const allowed = ["title", "company", "years", "description"];
    const update: Record<string, any> = {};

    for (const key of allowed) {
      if (data?.[key] !== undefined) {
        update[key] = key === "years" ? Number(data[key]) : data[key];
      }
    }
    return update;
  }

  private static toCoverLetterUpdate(data: any) {
    const allowed = ["title", "content"];
    const update: Record<string, any> = {};

    for (const key of allowed) {
      if (data?.[key] !== undefined) {
        update[key] = data[key];
      }
    }
    return update;
  }

  static toResumeEntity(file: Express.Multer.File, uploadedUrl: string) {
    return {
      url: uploadedUrl,
      name: file.originalname,
      isDefault: false,
      uploadedAt: new Date(),
    };
  }
}
