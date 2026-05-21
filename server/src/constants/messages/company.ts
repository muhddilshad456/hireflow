// constants/companyMessages.ts

export const COMPANY_MESSAGES = {
  // General
  COMPANY_CREATED: "Company created successfully",
  COMPANY_UPDATED: "Company updated successfully",
  COMPANY_DELETED: "Company deleted successfully",

  // Not found
  COMPANY_NOT_FOUND: "Company not found",
  NO_COMPANY_ASSOCIATED: "No company associated with this user",

  // ID related
  COMPANY_ID_REQUIRED: "Company ID is required",
  INVALID_COMPANY_ID: "Invalid company ID format",

  // Validation
  COMPANY_NAME_REQUIRED: "Company name is required",
  INVALID_COMPANY_NAME: "Invalid company name",
  COMPANY_EMAIL_REQUIRED: "Company email is required",
  INVALID_COMPANY_EMAIL: "Invalid company email format",
  COMPANY_PHONE_REQUIRED: "Company phone number is required",
  INVALID_COMPANY_PHONE: "Invalid company phone number",

  // Business logic
  COMPANY_ALREADY_EXISTS: "Company already exists",
  COMPANY_REG_NUMBER_REQUIRED: "Company registration number is required",
  INVALID_REG_NUMBER: "Invalid registration number",

  // Access / Permission
  NOT_COMPANY_ADMIN: "User is not a company admin",
  COMPANY_ACCESS_DENIED: "You do not have access to this company",

  // Status
  COMPANY_INACTIVE: "Company is inactive",
  COMPANY_BLOCKED: "Company is blocked",

  // File / Logo
  COMPANY_LOGO_REQUIRED: "Company logo is required",
  INVALID_COMPANY_LOGO: "Invalid company logo format",

  // Fallback
  COMPANY_OPERATION_FAILED: "Company operation failed, please try again",
} as const;
