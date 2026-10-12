import { Router } from "express";
import { container } from "../../../../dependency-injection/container";
import { IInterviewerController } from "../../../../controllers/v1/company/interviewer/interface/IInterviewerController";
import { TYPES } from "../../../../dependency-injection/types";
import { verifyAccessToken } from "../../../../middlewares/auth.middleware";
import { validateDto } from "../../../../middlewares/validate.middleware";
import { UpdateInterviewerProfileDto } from "../../../../dtos/v1/interviewer/updateInterviewProfileDto";
import { roleGuard } from "../../../../middlewares/role.middleware";
import { UserRole } from "../../../../constants/roles";

const router = Router();

const interviewerController = container.get<IInterviewerController>(
  TYPES.InterviewerController,
);
router.get(
  "/profile",
  verifyAccessToken,
  interviewerController.getInterviewerProfile.bind(interviewerController),
);
router.patch(
  "/profile/availability",
  verifyAccessToken,
  interviewerController.toggleAvailability.bind(interviewerController),
);
router.patch(
  "/profile",
  validateDto(UpdateInterviewerProfileDto),
  verifyAccessToken,
  interviewerController.updateInterviewerProfile.bind(interviewerController),
);
//* get interview requests
router.get(
  "/interview-requests",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_INTERVIEWER]),
  interviewerController.getInterviewRequests.bind(interviewerController),
);
//* make a decision on interview request
router.patch(
  "/interview-requests/:id/decision",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_INTERVIEWER]),
  interviewerController.updateIntReqDecision.bind(interviewerController),
);
//* get interviews
router.get(
  "/interviews",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_INTERVIEWER]),
  interviewerController.getInterviews.bind(interviewerController),
);
export default router;
