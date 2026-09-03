import { Router } from "express";
import { container } from "../../dependency-injection/container";
import { IMessageController } from "../../controllers/v1/chat/message/interface/IMessageController";
import { TYPES } from "../../dependency-injection/types";
import { upload } from "../../config/multer";
import { validateDto } from "../../middlewares/validate.middleware";
import { ConversationDto } from "../../dtos/v1/chat/conversation.dto";
import { IConversationController } from "../../controllers/v1/chat/conversation/interface/IConversationController";
import { verifyAccessToken } from "../../middlewares/auth.middleware";

const router = Router();

router.post(
  "/conversations",
  verifyAccessToken,
  validateDto(ConversationDto),
  (req, res, next) => {
    try {
      const conversationController = container.get<IConversationController>(
        TYPES.ConversationController,
      );
      conversationController.createOrGet(req, res, next);
    } catch (error: any) {
      console.log(error);
    }
  },
);

router.get("/conversations/job/:jobId", verifyAccessToken, (req, res, next) => {
  const conversationController = container.get<IConversationController>(
    TYPES.ConversationController,
  );
  conversationController.list(req, res, next);
});

router.get(
  "/conversations/:id/messages",
  verifyAccessToken,
  (req, res, next) => {
    const messageController = container.get<IMessageController>(
      TYPES.MessageController,
    );
    messageController.getMessages(req, res, next);
  },
);

router.post(
  "/conversations/:id/messages",
  verifyAccessToken,
  upload.single("attachment"),
  (req, res, next) => {
    const messageController = container.get<IMessageController>(
      TYPES.MessageController,
    );
    messageController.sendMessage(req, res, next);
  },
);

router.patch("/conversations/:id/read", verifyAccessToken, (req, res, next) => {
  const messageController = container.get<IMessageController>(
    TYPES.MessageController,
  );
  messageController.markRead(req, res, next);
});

export default router;
