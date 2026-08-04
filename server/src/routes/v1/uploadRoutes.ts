import { Router } from "express";
import { IUploadController } from "../../controllers/v1/upload/interface/IUploadController";
import { container } from "../../dependency-injection/container";
import { TYPES } from "../../dependency-injection/types";
import { upload } from "../../config/multer";
import { verifyAccessToken } from "../../middlewares/auth.middleware";

const router = Router();

const uploadController = container.get<IUploadController>(
  TYPES.UploadController,
);

router.post(
  "/upload-file",
  upload.single("file"),
  verifyAccessToken,
  uploadController.upload.bind(uploadController),
);

export default router;
