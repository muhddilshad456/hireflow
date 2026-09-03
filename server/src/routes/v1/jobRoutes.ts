import { Router } from "express";
import { TYPES } from "../../dependency-injection/types";
import { container } from "../../dependency-injection/container";
import { IJobController } from "../../controllers/v1/job/interface/IJobController";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";

const router = Router();

const jobController = container.get<IJobController>(TYPES.JobController);
//* get jobs
router.get(
  "/jobs",
  verifyAccessToken,
  jobController.getJobs.bind(jobController),
);
//* get a job
router.get("/job/:id", jobController.getJob.bind(jobController));
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
router.get(
  "/:jobId/application-status",
  verifyAccessToken,
  jobController.applicationStatus.bind(jobController),
);
export default router;
