import { Router } from "express";
import { validateDto } from "../../../../middlewares/validate.middleware";
import { JobDto } from "../../../../dtos/v1/job/job.dto";
import { container } from "../../../../dependency-injection/container";
import { TYPES } from "../../../../dependency-injection/types";
import { IRecruiterController } from "../../../../controllers/v1/company/recruiter/interface/IRecruiterController";
import { verifyAccessToken } from "../../../../middlewares/auth.middleware";
import { roleGuard } from "../../../../middlewares/role.middleware";
import { UserRole } from "../../../../constants/roles";

const router = Router();

const recruiterController = container.get<IRecruiterController>(
  TYPES.RecruiterController,
);

router.post(
  "/create-job",
  verifyAccessToken,
  validateDto(JobDto),
  recruiterController.createJob.bind(recruiterController),
);
router.put(
  "/edit-job/:jobId",
  verifyAccessToken,
  validateDto(JobDto),
  recruiterController.updateJob.bind(recruiterController),
);
router.get(
  "/jobs/:jobId/ai-filter-candidates",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_RECRUITER]),
  recruiterController.aiFilterCandidates.bind(recruiterController),
);
router.get(
  "/interviewers",
  verifyAccessToken,
  recruiterController.getCompanyInterviewers.bind(recruiterController),
);

export default router;
