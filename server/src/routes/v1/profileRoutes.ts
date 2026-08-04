import { Router } from "express";
import { container } from "../../dependency-injection/container";
import { TYPES } from "../../dependency-injection/types";
import { IProfileController } from "../../controllers/v1/profile/interface/IProfileController";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";

const router = Router();

const profileController = container.get<IProfileController>(
  TYPES.ProfileController,
);

//* get profile
router.get(
  "/get-profile",
  verifyAccessToken,
  profileController.getProfile.bind(profileController),
);
//* update basic info (name and profile picture)
router.patch(
  "/basic-info",
  upload.single("avatar"),
  verifyAccessToken,
  profileController.updateBasicInfo.bind(profileController),
);
//* update basic profile ( non array fields )
router.patch(
  "/basic-profile",
  verifyAccessToken,
  profileController.updateBasicProfile.bind(profileController),
);
//* skills
router.post(
  "/skills",
  verifyAccessToken,
  profileController.addSkill.bind(profileController),
);
router.delete(
  "/skills/:skill",
  verifyAccessToken,
  profileController.removeSkill.bind(profileController),
);
//* resume
router.post(
  "/resume",
  upload.single("resume"),
  verifyAccessToken,
  profileController.addResume.bind(profileController),
);
//* add array fields
router.post(
  "/items/:field",
  verifyAccessToken,
  profileController.addProfileItem.bind(profileController),
);
router.patch(
  "/items/:field/:itemId",
  verifyAccessToken,
  profileController.updateProfileItem.bind(profileController),
);
router.delete(
  "/items/:field/:itemId",
  verifyAccessToken,
  profileController.removeProfileItem.bind(profileController),
);

export default router;
