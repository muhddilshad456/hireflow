import { Router } from "express";
import { TYPES } from "../../dependency-injection/types";
import { container } from "../../dependency-injection/container";
import { IJobController } from "../../controllers/v1/job/interface/IJobController";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";
import { roleGuard } from "../../middlewares/role.middleware";
import { UserRole } from "../../constants/roles";
import { validateDto } from "../../middlewares/validate.middleware";
import { UpdateJobStatusDto } from "../../dtos/v1/job/updateJobStatus.dto";

const router = Router();

const jobController = container.get<IJobController>(TYPES.JobController);
//* get jobs
router.get(
  "/jobs",
  verifyAccessToken,
  jobController.getJobs.bind(jobController),
);
//* get a job
router.get(
  "/job/:id",
  verifyAccessToken,
  jobController.getJob.bind(jobController),
);
//* get a job with full datatils
router.get("/details/:jobId", jobController.getJobDetails.bind(jobController));
//* change status
router.patch("/status/:id", jobController.updateStatus.bind(jobController));
//* job application
router.post(
  "/apply/:jobId",
  verifyAccessToken,
  jobController.applyJob.bind(jobController),
);
//* get candidates in each stage
router.get(
  "/:jobId/stages/:stageId/candidates",
  jobController.getStageCandidates.bind(jobController),
);
//* add assesment stage task
router.post(
  "/:jobId/stages/:stageId/assessment",
  upload.single("file"),
  jobController.addAssesmentTask.bind(jobController),
);
//* application status
router.get(
  "/:jobId/application-status",
  verifyAccessToken,
  jobController.applicationStatus.bind(jobController),
);
//* add document verifitcation description
router.patch(
  "/job-stages/:jobStageId/document-verification-description",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_RECRUITER]),
  jobController.setDocVerDescription.bind(jobController),
);
//* update job status
router.patch(
  "/:jobId/status",
  verifyAccessToken,
  validateDto(UpdateJobStatusDto),
  roleGuard([UserRole.COMPANY_RECRUITER]),
  jobController.updateJobStatus.bind(jobController),
);
export default router;
