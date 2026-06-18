import { Router } from "express";
import { container } from "../../dependency-injection/container";
import { TYPES } from "../../dependency-injection/types";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../middlewares/role.middleware";
import { UserRole } from "../../constants/roles";
import { IUserController } from "../../controllers/v1/users/interface/IUserController";
import { IAdminController } from "../../controllers/v1/admin/interface/IAdminController";
import { validateDto } from "../../middlewares/validate.middleware";
import { CompanyRejectDto } from "../../dtos/v1/company/admin/request-dtos/companyRejectDto";

const router = Router();

const userController = container.get<IUserController>(TYPES.UserController);
const adminController = container.get<IAdminController>(TYPES.AdminController);

router.get(
  "/users",
  verifyAccessToken,
  roleGuard([UserRole.ADMIN]),
  userController.getAllUsers.bind(userController),
);
router.patch(
  "/users/status/:userId",
  verifyAccessToken,
  roleGuard([UserRole.ADMIN]),
  userController.updateUser.bind(userController),
);
router.get(
  "/company-verification-requests",
  adminController.getAllCompanyVerificationReq.bind(adminController),
);
router.get(
  "/company-verification-request/:id",
  adminController.getCompanyVerificationReq.bind(adminController),
);
router.post(
  "/approve-company/:id",
  adminController.approveCompany.bind(adminController),
);
router.patch(
  "/reject-company/:id",
  validateDto(CompanyRejectDto),
  adminController.rejectCompany.bind(adminController),
);
router.get("/companies", adminController.getAllCompanies.bind(adminController));

router.get(
  "/company/:id",
  verifyAccessToken,
  roleGuard([UserRole.ADMIN]),
  adminController.getCompanyDetails.bind(adminController),
);

export default router;
