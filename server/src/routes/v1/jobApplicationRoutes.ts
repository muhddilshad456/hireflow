import { Router } from "express";
import { TYPES } from "../../dependency-injection/types";
import { container } from "../../dependency-injection/container";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { IJobApplicationController } from "../../controllers/v1/job application/interface/IJobApplicationController";
import { validateDto } from "../../middlewares/validate.middleware";
import { UpdateApplicationStageDto } from "../../dtos/v1/application/update-application-stage-dto";
import { roleGuard } from "../../middlewares/role.middleware";
import { UserRole } from "../../constants/roles";
import { MoveMultipleToNextStageDto } from "../../dtos/v1/application/move-to-next-stage-bulk-dto";
import { upload } from "../../config/multer";

const router = Router();

const jobApplicationController = container.get<IJobApplicationController>(
  TYPES.JobApplicationController,
);
//* get my applications
router.get(
  "/applications/my",
  verifyAccessToken,
  jobApplicationController.getMyApplications.bind(jobApplicationController),
);
//* get application
router.get(
  "/applications/my/:applicationId",
  verifyAccessToken,
  jobApplicationController.getMyApplicationDetails.bind(
    jobApplicationController,
  ),
);
//* update application stage
router.patch(
  "/application-stages/:appStageId/decision",
  validateDto(UpdateApplicationStageDto),
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_RECRUITER]),
  jobApplicationController.updateApplicationStage.bind(
    jobApplicationController,
  ),
);
//* bulk move to next stage
router.patch(
  "/stage/next/bulk",
  validateDto(MoveMultipleToNextStageDto),
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_RECRUITER]),
  jobApplicationController.moveMultipleToNextStage.bind(
    jobApplicationController,
  ),
);
//* get application stage details
router.get(
  "/:applicationId/stage/:jobStageId",
  verifyAccessToken,
  jobApplicationController.getJobApplicationStageDetails.bind(
    jobApplicationController,
  ),
);
//* add or edit assessment responce
router.post(
  "/:applicationId/stage/:jobStageId/assessment-response",
  upload.single("file"),
  verifyAccessToken,
  jobApplicationController.addOrEditAssessmentResponse.bind(
    jobApplicationController,
  ),
);
export default router;
