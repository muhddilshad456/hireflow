export const UPLOAD_MESSAGES = {
  // ✅ General Upload
  UPLOAD_SUCCESS: "File uploaded successfully",
  UPLOAD_FAILED: "Failed to upload file",

  // ✅ File Validation
  FILE_REQUIRED: "File is required",
  INVALID_FILE: "Invalid file provided",
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_TYPE_NOT_ALLOWED: "This file type is not allowed",
  FILE_TOO_LARGE: "File size exceeds the allowed limit",
  EMPTY_FILE: "The uploaded file is empty",

  // ✅ File Processing
  FILE_PROCESSING_FAILED: "Failed to process the uploaded file",
  FILE_DELETE_SUCCESS: "File deleted successfully",
  FILE_DELETE_FAILED: "Failed to delete file",
  FILE_NOT_FOUND: "File not found",

  // ✅ Authorization
  UNAUTHORIZED_FILE_ACCESS: "You are not authorized to access this file",
} as const;
