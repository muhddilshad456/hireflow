import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatButtonProps {
  applicationId: string;
}

export function CandidateChatButton({ applicationId }: ChatButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() =>
        navigate(`/company/recruiter/message/application/${applicationId}`)
      }
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
    >
      <MessageCircle className="h-3.5 w-3.5" />
      Chat
    </button>
  );
}
