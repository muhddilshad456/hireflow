import { Router } from "express";
import { container } from "../../dependency-injection/container";
import { TYPES } from "../../dependency-injection/types";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../middlewares/role.middleware";
import { UserRole } from "../../constants/roles";
import { IUserController } from "../../controllers/v1/users/interface/IUserController";

const router = Router();

const userController = container.get<IUserController>(TYPES.UserController);

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

export default router;
