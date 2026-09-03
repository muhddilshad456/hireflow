import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Paperclip,
  Send,
  Smile,
  MoreVertical,
  Ban,
  MessageSquareOff,
  ArrowLeft,
} from "lucide-react";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../../../../shared/services/messageService";
import { useSocket } from "../../../../../context/SocketContext";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../redux/store/store";
import { useParams } from "react-router-dom";

/* ================= TYPES ================= */

type SenderRole = "RECRUITER" | "CANDIDATE";

type ApplicationStageLabel =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

interface MessageAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: SenderRole;
  content?: string;
  attachment?: MessageAttachment;
  isRead: boolean;
  createdAt: string;
}

interface ConversationParticipant {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  jobTitle?: string;
  company?: string;
}

interface Conversation {
  _id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidate: ConversationParticipant;
  stage: ApplicationStageLabel;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isActive: boolean;
}

/* ================= UTILS ================= */

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

/* ================= AVATAR ================= */

const PALETTE = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function colorFor(name: string) {
  const idx = name.charCodeAt(0) % PALETTE.length;
  return PALETTE[idx];
}

function initials(name: string) {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

function Avatar({
  name,
  src,
  size = 40,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className="rounded-full object-cover flex-shrink-0"
      />
    );
  }

  return (
    <div
      style={style}
      className={`rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold uppercase ${colorFor(
        name,
      )}`}
    >
      {initials(name)}
    </div>
  );
}

/* ================= STAGE BADGE ================= */

const STAGE_STYLES: Record<ApplicationStageLabel, string> = {
  APPLIED: "bg-slate-100 text-slate-600",
  SCREENING: "bg-amber-100 text-amber-700",
  INTERVIEW: "bg-blue-100 text-blue-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  HIRED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-600",
};

const STAGE_LABELS: Record<ApplicationStageLabel, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

function StageBadge({ stage }: { stage: ApplicationStageLabel }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${STAGE_STYLES[stage]}`}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}

/* ================= CONVERSATION LIST ITEM ================= */

function ConversationListItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex gap-3 border-l-2 transition-colors ${
        isActive
          ? "bg-blue-50 border-l-blue-600"
          : "border-l-transparent hover:bg-slate-50"
      }`}
    >
      <Avatar
        name={conversation.candidate.name}
        src={conversation.candidate.avatar}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-slate-900 truncate">
            {conversation.candidate.name}
          </span>
          {conversation.lastMessageAt && (
            <span className="text-[11px] text-slate-400 flex-shrink-0">
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 truncate mt-0.5">
          {conversation.lastMessagePreview ?? "No messages yet"}
        </p>

        <div className="flex items-center gap-2 mt-1.5">
          {conversation.unreadCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
          <StageBadge stage={conversation.stage} />
        </div>
      </div>
    </button>
  );
}

/* ================= CONVERSATION LIST ================= */

function ConversationList({
  conversations,
  activeConversationId,
  searchTerm,
  onSearchChange,
  onSelect,
}: {
  conversations: Conversation[];
  activeConversationId?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelect: (conversation: Conversation) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidates..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 rounded-lg border border-transparent focus:border-blue-400 focus:bg-white outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-between mt-3 px-1">
          <span className="text-[11px] font-medium text-slate-400 tracking-wide">
            CANDIDATES
          </span>
          <button className="text-[11px] text-slate-500 hover:text-slate-700">
            Filter: All ▾
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {conversations.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10 px-4">
            No conversations match your search.
          </p>
        ) : (
          conversations.map((c) => (
            <ConversationListItem
              key={c._id}
              conversation={c}
              isActive={c._id === activeConversationId}
              onClick={() => onSelect(c)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ================= MESSAGE BUBBLE ================= */

function MessageBubble({
  message,
  isOwn,
  senderName,
  senderAvatar,
}: {
  message: ChatMessage;
  isOwn: boolean;
  senderName: string;
  senderAvatar?: string;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
      <Avatar name={senderName} src={senderAvatar} size={28} />

      <div
        className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isOwn ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-slate-100 text-slate-800 rounded-bl-sm"
          }`}
        >
          {message.content && <p>{message.content}</p>}

          {message.attachment && (
            <a
              href={message.attachment.url}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-2 mt-1.5 text-xs underline ${
                isOwn ? "text-blue-100" : "text-blue-600"
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              {message.attachment.name}
            </a>
          )}
        </div>

        <span className="text-[10px] text-slate-400 mt-1 px-1">
          {isOwn ? "You" : senderName} · {time}
        </span>
      </div>
    </div>
  );
}

/* ================= MESSAGE INPUT ================= */

function MessageInput({
  disabled,
  onSend,
}: {
  disabled?: boolean;
  onSend: (content: string, file?: File) => void;
}) {
  const [value, setValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSend("", file);
    e.target.value = "";
  };

  return (
    <div className="border-t border-slate-100 p-3">
      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="text-slate-400 hover:text-slate-600 disabled:opacity-40"
        >
          <Paperclip className="w-4.5 h-4.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFilePick}
        />

        <input
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            disabled ? "This conversation is closed" : "Type a message..."
          }
          className="flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed"
        />

        <button className="text-slate-400 hover:text-slate-600">
          <Smile className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-slate-300 mt-1.5 text-center">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}

/* ================= CHAT WINDOW ================= */

function ChatWindow({
  conversation,
  messages,
  currentUserId,
  typingLabel,
  onSend,
  onCloseConversation,
}: {
  conversation: Conversation | null;
  messages: ChatMessage[];
  currentUserId: string;
  typingLabel?: string;
  onSend: (content: string, file?: File) => void;
  onCloseConversation?: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400">
        <MessageSquareOff className="w-10 h-10 mb-2" />
        <p className="text-sm">Select a candidate to view the conversation</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Avatar
            name={conversation.candidate.name}
            src={conversation.candidate.avatar}
            size={44}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-slate-900">
                {conversation.candidate.name}
              </h2>
              <StageBadge stage={conversation.stage} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {conversation.jobTitle}
              {conversation.candidate.company
                ? ` @ ${conversation.candidate.company}`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {conversation.isActive && onCloseConversation && (
            <button
              onClick={onCloseConversation}
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600"
            >
              <Ban className="w-3.5 h-3.5" />
              Close
            </button>
          )}
          <button className="text-slate-400 hover:text-slate-600">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/40">
        {!conversation.isActive && (
          <div className="text-center text-[11px] text-slate-400 bg-slate-100 rounded-full py-1.5 px-3 w-fit mx-auto">
            This conversation is closed
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            message={m}
            isOwn={m.senderId === currentUserId}
            senderName={
              m.senderId === currentUserId ? "You" : conversation.candidate.name
            }
            senderAvatar={
              m.senderId === currentUserId
                ? undefined
                : conversation.candidate.avatar
            }
          />
        ))}

        {typingLabel && (
          <p className="text-xs text-slate-400 italic px-1">
            {typingLabel} is typing…
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <MessageInput disabled={!conversation.isActive} onSend={onSend} />
    </div>
  );
}

/* ================= MAIN PAGE ================= */

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [activeConversationId, setActiveConversationId] = useState<
    string | undefined
  >();
  const [searchTerm, setSearchTerm] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const socket = useSocket();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const { jobId } = useParams<{ jobId: string }>();

  const fetchConversations = async () => {
    try {
      if (!jobId) return;
      const result = await getConversations(jobId);
      setConversations(result.data);
      if (result.data.length > 0) {
        setActiveConversationId(result.data[0]._id);
      }
    } catch (error: any) {
      console.log(error?.response);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const filteredConversations = useMemo(
    () =>
      conversations.filter((c) =>
        c.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [conversations, searchTerm],
  );

  const activeConversation =
    conversations.find((c) => c._id === activeConversationId) ?? null;
  const activeMessages = activeConversationId
    ? (messagesByConversation[activeConversationId] ?? [])
    : [];

  const handleSelect = (conversation: Conversation) => {
    setActiveConversationId(conversation._id);
    setShowChatOnMobile(true);
  };

  useEffect(() => {
    if (!activeConversationId || !socket) return;

    const fetchMessages = async () => {
      try {
        const result = await getMessages(activeConversationId);
        setMessagesByConversation((prev) => ({
          ...prev,
          [activeConversationId]: result.data,
        }));
      } catch (error: any) {
        console.log(error?.response);
      }
    };

    fetchMessages();
    socket.emit("conversation:join", activeConversationId);

    const handleNewMessage = (message: ChatMessage) => {
      setMessagesByConversation((prev) => ({
        ...prev,
        [message.conversationId]: [
          ...(prev[message.conversationId] ?? []),
          message,
        ],
      }));
    };

    const handleSocketError = (err: { message: string }) => {
      console.error("Socket error:", err.message);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("error", handleSocketError);

    return () => {
      socket.emit("conversation:leave", activeConversationId);
      socket.off("message:new", handleNewMessage);
      socket.off("error", handleSocketError);
    };
  }, [activeConversationId, socket]);

  const handleSend = async (content: string, file?: File) => {
    if (!activeConversationId) return;

    if (file) {
      try {
        const result = await sendMessage(activeConversationId, content, file);
        setMessagesByConversation((prev) => ({
          ...prev,
          [activeConversationId]: [
            ...(prev[activeConversationId] ?? []),
            result.data,
          ],
        }));
      } catch (error: any) {
        console.error(
          "sendMessage (attachment) failed:",
          error?.response?.data ?? error,
        );
      }
      return;
    }

    if (!content.trim()) return;

    if (!socket || !socket.connected) {
      console.warn("Cannot send — socket not connected yet");
      return;
    }

    socket.emit("message:send", {
      conversationId: activeConversationId,
      content: content.trim(),
    });
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">Messages</h1>

      <div className="flex-1 min-h-0 flex gap-4">
        {/* Conversation list — hidden on mobile once a chat is open */}
        <div
          className={`w-full sm:w-[320px] flex-shrink-0 ${
            showChatOnMobile ? "hidden sm:block" : "block"
          }`}
        >
          <ConversationList
            conversations={filteredConversations}
            activeConversationId={activeConversationId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelect={handleSelect}
          />
        </div>

        {/* Chat window — hidden on mobile until a conversation is selected */}
        <div
          className={`flex-1 min-w-0 ${showChatOnMobile ? "flex flex-col" : "hidden sm:flex sm:flex-col"}`}
        >
          {showChatOnMobile && (
            <button
              onClick={() => setShowChatOnMobile(false)}
              className="sm:hidden flex items-center gap-1 text-xs text-slate-500 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to candidates
            </button>
          )}
          <ChatWindow
            conversation={activeConversation}
            messages={activeMessages}
            currentUserId={currentUserId!}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
}
