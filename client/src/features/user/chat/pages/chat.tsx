import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paperclip,
  Send,
  Smile,
  ArrowLeft,
  Lock,
  MessageSquareOff,
} from "lucide-react";
import {
  createOrGetConversation,
  getMessages,
  sendMessage,
  markConversationAsRead,
} from "../../../shared/services/messageService";

import { useSelector } from "react-redux";
import { useSocket } from "../../../../context/SocketContext";
import type { RootState } from "../../../../redux/store/store";

/* ================= TYPES ================= */

type SenderRole = "RECRUITER" | "CANDIDATE";

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
}

interface Conversation {
  _id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  recruiter: ConversationParticipant;
  isActive: boolean;
}

type PageState = "loading" | "locked" | "error" | "ready";

/* ================= AVATAR ================= */

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
  const initials = name
    .trim()
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
      className="rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold bg-orange-500"
    >
      {initials}
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
              ? "bg-orange-500 text-white rounded-br-sm"
              : "bg-orange-50 text-slate-800 rounded-bl-sm border border-orange-100"
          }`}
        >
          {message.content && <p>{message.content}</p>}

          {message.attachment && (
            <a
              href={message.attachment.url}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-2 mt-1.5 text-xs underline ${
                isOwn ? "text-orange-100" : "text-orange-600"
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
    <div className="border-t border-orange-100 p-3">
      <div className="flex items-center gap-2 bg-orange-50/60 rounded-xl px-3 py-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="text-orange-400 hover:text-orange-600 disabled:opacity-40"
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

        <button className="text-orange-400 hover:text-orange-600">
          <Smile className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white disabled:opacity-40 hover:bg-orange-600 transition-colors"
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

/* ================= LOCKED STATE ================= */

function LockedState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-orange-50/40 border border-orange-100 rounded-xl text-center px-6">
      <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-orange-500" />
      </div>
      <h2 className="text-base font-semibold text-slate-800 mb-1.5">
        Chat isn't available yet
      </h2>
      <p className="text-sm text-slate-500 max-w-sm">
        You'll be able to message the recruiter once your application clears the
        resume review stage. Hang tight — we'll notify you when there's an
        update.
      </p>
      <button
        onClick={onBack}
        className="mt-5 flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to my applications
      </button>
    </div>
  );
}

/* ================= MAIN PAGE ================= */

export function ChatPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const socket = useSocket();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  const [pageState, setPageState] = useState<PageState>("loading");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Step 1: create-or-get the conversation for this application
  const initializedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    if (initializedForRef.current === applicationId) return;
    initializedForRef.current = applicationId;

    const init = async () => {
      try {
        const result = await createOrGetConversation(applicationId);
        console.log("result of conversation fetch : ", result);
        setConversation(result.data);
        setPageState("ready");
      } catch (error: any) {
        console.log(error.response);
        if (error?.response?.status === 403) {
          setPageState("locked");
        } else {
          setPageState("error");
        }
      }
    };

    init();
  }, [applicationId]);

  // Step 2: once we have a conversation, fetch history + join the socket room
  useEffect(() => {
    if (!conversation || !socket) return;

    const fetchMessages = async () => {
      try {
        const result = await getMessages(conversation._id);
        setMessages(result.data);
      } catch (error: any) {
        console.error(error?.response ?? error);
      }
    };

    fetchMessages();
    socket.emit("conversation:join", conversation._id);
    markConversationAsRead(conversation._id).catch((error: any) =>
      console.error(error?.response ?? error),
    );

    const handleNewMessage = (message: ChatMessage) => {
      if (message.conversationId !== conversation._id) return;
      setMessages((prev) => [...prev, message]);
    };

    const handleSocketError = (err: { message: string }) => {
      console.error("Socket error:", err.message);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("error", handleSocketError);

    return () => {
      socket.emit("conversation:leave", conversation._id);
      socket.off("message:new", handleNewMessage);
      socket.off("error", handleSocketError);
    };
  }, [conversation, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (content: string, file?: File) => {
    if (!conversation) return;

    if (file) {
      try {
        const result = await sendMessage(conversation._id, content, file);
        setMessages((prev) => [...prev, result.data]);
      } catch (error: any) {
        console.error(error?.response ?? error);
      }
      return;
    }

    if (!content.trim() || !socket || !socket.connected) return;
    socket.emit("message:send", {
      conversationId: conversation._id,
      content: content.trim(),
    });
  };

  /* ---------- RENDER STATES ---------- */

  if (pageState === "loading") {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
        Loading conversation…
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        <MessageSquareOff className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-sm text-slate-500">
          Something went wrong loading this conversation. Please try again.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  if (pageState === "locked") {
    return (
      <div className="h-full flex flex-col p-4 sm:p-6">
        <LockedState onBack={() => navigate(-1)} />
      </div>
    );
  }

  if (!conversation || !currentUserId) return null;

  return (
    <div className="h-full flex flex-col p-4 sm:p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-3 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to applications
      </button>

      <div className="flex-1 min-h-0 flex flex-col bg-white border border-orange-100 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-orange-100 bg-orange-50/40">
          <Avatar
            name={conversation.recruiter.name}
            src={conversation.recruiter.avatar}
            size={44}
          />
          <div>
            <h2 className="font-semibold text-sm text-slate-900">
              {conversation.recruiter.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recruiter · {conversation.jobTitle}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-orange-50/10">
          {!conversation.isActive && (
            <div className="text-center text-[11px] text-slate-400 bg-orange-50 rounded-full py-1.5 px-3 w-fit mx-auto">
              This conversation is closed
            </div>
          )}

          {messages.length === 0 ? (
            <p className="text-sm text-slate-400 text-center mt-10">
              Say hello — start the conversation with{" "}
              {conversation.recruiter.name}.
            </p>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m._id}
                message={m}
                isOwn={m.senderId === currentUserId}
                senderName={
                  m.senderId === currentUserId
                    ? "You"
                    : conversation.recruiter.name
                }
                senderAvatar={
                  m.senderId === currentUserId
                    ? undefined
                    : conversation.recruiter.avatar
                }
              />
            ))
          )}

          <div ref={bottomRef} />
        </div>

        <MessageInput disabled={!conversation.isActive} onSend={handleSend} />
      </div>
    </div>
  );
}
