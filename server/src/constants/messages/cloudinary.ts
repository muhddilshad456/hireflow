export const CLOUDINARY_MESSAGES = {
  // ✅ Upload
  UPLOAD_SUCCESS: "File uploaded successfully",
  UPLOAD_FAILED: "Cloudinary upload failed",

  // ✅ Update / Replace
  UPDATE_SUCCESS: "File updated successfully",
  UPDATE_FAILED: "Cloudinary update failed",

  // ✅ Delete
  DELETE_SUCCESS: "File deleted successfully",
  DELETE_FAILED: "Cloudinary deletion failed",

  // ✅ File Issues
  FILE_NOT_PROVIDED: "No file provided",
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_SIZE_EXCEEDED: "File size exceeds the allowed limit",

  // ✅ URL / Public ID
  INVALID_PUBLIC_ID: "Invalid Cloudinary public ID",
  INVALID_FILE_URL: "Invalid file URL",

  // ✅ Processing Errors
  TRANSFORMATION_FAILED: "Image transformation failed",
  OPTIMIZATION_FAILED: "Image optimization failed",

  // ✅ General
  CLOUDINARY_ERROR: "Cloudinary service error",
} as const;
