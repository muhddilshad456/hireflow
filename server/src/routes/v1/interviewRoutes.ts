import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { container } from "../../dependency-injection/container";
import { IInterviewController } from "../../controllers/v1/interview/interface/IInterviewController";
import { TYPES } from "../../dependency-injection/types";
import { validateDto } from "../../middlewares/validate.middleware";
import { CreateInterviewRequestDto } from "../../dtos/v1/interview/createInterviewRequestDto";

const router = Router();

const interviewController = container.get<IInterviewController>(
  TYPES.InterviewController,
);

router.post(
  "/interview-requests",
  validateDto(CreateInterviewRequestDto),
  verifyAccessToken,
  interviewController.createInterviewRequest.bind(interviewController),
);
router.get(
  "/interview/:id",
  verifyAccessToken,
  interviewController.getInterviewDetails.bind(interviewController),
);
router.patch(
  "/interview/:id/feedback",
  verifyAccessToken,
  interviewController.submitFeedback.bind(interviewController),
);

export default router;
