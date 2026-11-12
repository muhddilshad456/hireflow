import { UnreadUpdatePayload } from "../../../interfaces/chat/conversation";
import { MessageEntity } from "../../../interfaces/chat/message";

export interface IChatEventPublisher {
  publishNewMessage(conversationId: string, message: MessageEntity): void;
  publishUnreadUpdate(userId: string, payload: UnreadUpdatePayload): void;
}
