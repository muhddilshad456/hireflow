import { Router } from "express";
import { verifyAccessToken } from "../../../../middlewares/auth.middleware";
import { roleGuard } from "../../../../middlewares/role.middleware";
import { UserRole } from "../../../../constants/roles";
import { container } from "../../../../dependency-injection/container";
import { TYPES } from "../../../../dependency-injection/types";
import { upload } from "../../../../config/multer";
import { validateDto } from "../../../../middlewares/validate.middleware";
import { VerifyReqDto } from "../../../../dtos/v1/company/admin/request-dtos/verifyReqDto";
import { ICompanyController } from "../../../../controllers/v1/company/admin/interface/ICompanyController";

const router = Router();

const companyController = container.get<ICompanyController>(
  TYPES.CompanyController,
);

router.post(
  "/verify-request",
  upload.fields([
    { name: "document", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  validateDto(VerifyReqDto),
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_ADMIN]),
  companyController.createVerifyRequest.bind(companyController),
);

router.get(
  "/verification-status",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_ADMIN]),
  companyController.getVerificationStatus.bind(companyController),
);

router.post(
  "/invite",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_ADMIN]),
  companyController.invite.bind(companyController),
);

router.get(
  "/profile",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_ADMIN]),
  companyController.getCompanyProfile.bind(companyController),
);
//* get dashboard details
router.get(
  "/dashboard",
  verifyAccessToken,
  roleGuard([UserRole.COMPANY_ADMIN]),
  companyController.getDashboard.bind(companyController),
);
router.get(
  "/invitations",
  verifyAccessToken,
  companyController.getAllInvitations.bind(companyController),
);
router.get(
  "/recruiters",
  verifyAccessToken,
  companyController.getRecruiters.bind(companyController),
);
router.get(
  "/interviewers",
  verifyAccessToken,
  companyController.getInterviewers.bind(companyController),
);
//* cancel request
router.patch(
  "/cancel-invitation/:id",
  verifyAccessToken,
  companyController.cancelInvitation.bind(companyController),
);

export default router;
