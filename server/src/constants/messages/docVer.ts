export const DOCUMENT_VERIFICATION_MESSAGES = {
  DESCRIPTION_SAVED: "Document verification description saved successfully",
  DOCUMENTS_UPDATED: "Documents updated successfully",

  INVALID_ID: "Invalid id",
  USER_NOT_FOUND: "User not found",
  USER_BLOCKED: "Your account is blocked",
  NO_COMPANY: "No company is linked to this account",
  JOB_NOT_FOUND: "Job not found",
  STAGE_NOT_FOUND: "Job stage not found",
  APPLICATION_NOT_FOUND: "Application not found",
  APPLICATION_STAGE_NOT_FOUND: "You haven't reached this stage yet",

  NOT_AUTHORIZED: "You are not allowed to do this",
  NOT_DOCUMENT_VERIFICATION_STAGE: "This is not a document verification stage",
  STAGE_MISMATCH: "This stage does not belong to the application's job",
  APPLICATION_NOT_ACTIVE: "This application is no longer active",
  STAGE_ALREADY_DECIDED:
    "Documents can't be changed after the stage has been decided",

  DESCRIPTION_REQUIRED: "Description is required",
  DESCRIPTION_TOO_LONG: `Description must be at most 1000 characters`,

  EXISTING_DOCUMENTS_REQUIRED:
    "existingDocuments is required: a JSON array of the URLs to keep (send [] to keep none)",
  EXISTING_DOCUMENTS_INVALID: "existingDocuments must be a JSON array of URLs",
  UNKNOWN_DOCUMENT: "One of the documents to keep was not found on your stage",
} as const;
