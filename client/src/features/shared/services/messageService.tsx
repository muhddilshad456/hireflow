import { CHAT_BASE_ROUTE } from "../../../constents/routes/apiRoutes";
import api from "../../../services/api";

export const getConversations = (jobId: string) => {
  return api
    .get(`/${CHAT_BASE_ROUTE}/conversations/job/${jobId}`)
    .then((res) => res.data);
};

export const createOrGetConversation = (applicationId: string) => {
  return api
    .post(`/${CHAT_BASE_ROUTE}/conversations`, { applicationId })
    .then((res) => res.data);
};

export const getMessages = (conversationId: string, cursor?: string) => {
  return api
    .get(`/${CHAT_BASE_ROUTE}/conversations/${conversationId}/messages`, {
      params: cursor ? { cursor } : undefined,
    })
    .then((res) => res.data);
};

export const sendMessage = (
  conversationId: string,
  content?: string,
  file?: File,
) => {
  const formData = new FormData();
  if (content) formData.append("content", content);
  if (file) formData.append("attachment", file);

  return api
    .post(
      `/${CHAT_BASE_ROUTE}/conversations/${conversationId}/messages`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
    .then((res) => res.data);
};

export const markConversationAsRead = (conversationId: string) => {
  return api
    .patch(`/${CHAT_BASE_ROUTE}/conversations/${conversationId}/read`)
    .then((res) => res.data);
};
