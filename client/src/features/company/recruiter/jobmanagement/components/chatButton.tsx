import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatButtonProps {
  jobId: string;
}

const ChatButton = ({ jobId }: ChatButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/company/recruiter/message/job/${jobId}`)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
    >
      Chat
      <MessageCircle className="h-3 w-3" />
    </button>
  );
};

export default ChatButton;
