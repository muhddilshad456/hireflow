import { Router } from "express";
import { TYPES } from "../../dependency-injection/types";
import { container } from "../../dependency-injection/container";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { IJobApplicationController } from "../../controllers/v1/job application/interface/IJobApplicationController";
import { validateDto } from "../../middlewares/validate.middleware";
import { MoveToNextStageDto } from "../../dtos/v1/application/move-to-next-stage-dto";
import { roleGuard } from "../../middlewares/role.middleware";
import { UserRole } from "../../constants/roles";

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
//* move to next stage
router.patch(
  "/:applicationId/stage/next",
  validateDto(MoveToNextStageDto),
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_RECRUITER]),
  jobApplicationController.moveToNextStage.bind(jobApplicationController),
);
export default router;
