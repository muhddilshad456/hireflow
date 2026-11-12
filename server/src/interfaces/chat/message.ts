import { Types } from "mongoose";
import { IFile } from "../file/file";

export type SenderRole = "company_recruiter" | "user";

export interface MessageEntity {
  _id?: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: SenderRole;
  content?: string;
  attachment?: IFile;
  isRead: boolean;
  createdAt?: Date;
}
