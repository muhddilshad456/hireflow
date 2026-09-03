import { MessageEntity } from "../../../interfaces/chat/message";

export interface IChatEventPublisher {
  publishNewMessage(conversationId: string, message: MessageEntity): void;
}
