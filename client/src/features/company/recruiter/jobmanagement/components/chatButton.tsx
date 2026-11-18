import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../../../../context/SocketContext";
import { getJobUnreadCount } from "../../../../shared/services/messageService";
import type { ChatUnreadPayload } from "../../../../../types/chat/chat";

const ChatButton = ({ jobId }: { jobId: string }) => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [count, setCount] = useState(0);

  // initial value, and a refetch whenever the socket reconnects
  useEffect(() => {
    let cancelled = false;
    getJobUnreadCount(jobId)
      .then((res) => {
        if (!cancelled) setCount(res.data.count);
      })
      .catch((e: any) => console.log(e?.response));
    return () => {
      cancelled = true;
    };
  }, [jobId, socket]);

  useEffect(() => {
    if (!socket) return;
    const onUnread = (p: ChatUnreadPayload) => {
      if (p.jobId !== jobId || p.jobUnreadConversations === undefined) return;
      setCount(p.jobUnreadConversations);
    };
    socket.on("chat:unread", onUnread);
    return () => {
      socket.off("chat:unread", onUnread);
    };
  }, [socket, jobId]);

  return (
    <button
      onClick={() => navigate(`/company/recruiter/message/job/${jobId}`)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
    >
      Chat
      <MessageCircle className="h-3 w-3" />
      {count > 0 && (
        <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
};

export default ChatButton;
