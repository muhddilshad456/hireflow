export interface ChatUnreadPayload {
  conversationId: string;
  applicationId: string;
  jobId: string;
  unreadCount: number;
  jobUnreadConversations?: number;
}
