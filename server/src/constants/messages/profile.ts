export const PROFILE_MESSAGES = {
  // ✅  Profile
  PROFILE_NOT_FOUND: "Profile not found",
  // ✅  Complete Profile
  COMPLETE_PROFILE: "Complete your profile before applying",
  // ✅ Fetch Profile
  FETCH_SUCCESS: "Profile fetched successfully",
  FETCH_FAILED: "Failed to fetch profile",

  // ✅ Basic Details (User)
  USER_NOT_FOUND: "User not found",
  USER_FETCH_SUCCESS: "User details fetched successfully",
  USER_UPDATE_SUCCESS: "User profile updated successfully",
  USER_UPDATE_FAILED: "Failed to update user profile",

  // ✅ Company Details
  COMPANY_NOT_FOUND: "Company not found",
  COMPANY_FETCH_SUCCESS: "Company details fetched successfully",
  COMPANY_UPDATE_SUCCESS: "Company profile updated successfully",
  COMPANY_UPDATE_FAILED: "Failed to update company profile",

  // ✅ General Profile Update (NEW)
  PROFILE_UPDATE_SUCCESS: "Profile updated successfully",
  PROFILE_UPDATE_FAILED: "Failed to update profile",
  PROFILE_PARTIAL_UPDATE: "Profile partially updated",
  PROFILE_NO_CHANGES: "No changes were made to the profile",

  // ✅ Validation
  INVALID_PROFILE_DATA: "Invalid profile data provided",
  REQUIRED_PROFILE_FIELDS: "Required profile fields are missing",

  // ✅ Authorization
  UNAUTHORIZED_PROFILE_ACCESS: "You are not authorized to access this profile",

  // ✅ Skills
  SKILL_REQUIRED: "Skill required",
  SKILL_NOT_FOUND: "Skill not found",
  // ✅ Resume
  RESUME_REQUIRED: "Resume file required",
} as const;
