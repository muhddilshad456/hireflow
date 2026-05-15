import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../middlewares/role.middleware";
import { UserRole } from "../../constants/roles";
import { container } from "../../dependency-injection/container";
import { TYPES } from "../../dependency-injection/types";
import { upload } from "../../config/multer";
import { validateDto } from "../../middlewares/validate.middleware";
import { VerifyReqDto } from "../../dtos/v1/company/verifyReqDto";
import { ICompanyController } from "../../controllers/v1/company/interface/ICompanyController";

const router = Router();

const companyController = container.get<ICompanyController>(
  TYPES.CompanyController,
);

router.post(
  "/verify-request",
  upload.single("document"),
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

router.post("/invite", companyController.invite.bind(companyController));

export default router;
