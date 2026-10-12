import { useEffect, useState } from "react";
import type { StageComponentProps } from "../StageRenderer";
import { getJobStageDetails } from "../../services/applicatioServices";
import { Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InterviewData {
  _id: string;
  scheduledAt: string;
  duration?: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

interface ApplicationStageData {
  status: "IN_PROGRESS" | "PASSED" | "FAILED";
  feedback?: string;
}

export function InterviewStage({ stage, application }: StageComponentProps) {
  const applicationId = application.applicationId;
  const jobStageId = stage.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationStage, setApplicationStage] =
    useState<ApplicationStageData | null>(null);
  const [interview, setInterview] = useState<InterviewData | null>(null);

  const navigate = useNavigate();

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJobStageDetails(applicationId, jobStageId);
      console.log("response of get job stage details : ", res);
      setApplicationStage(res.data.applicationStage);
      setInterview(res.data.interview);
    } catch (err) {
      setError("Failed to load interview details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [applicationId, jobStageId]);

  const isDecided =
    applicationStage?.status === "PASSED" ||
    applicationStage?.status === "FAILED";

  const isSelected = applicationStage?.status === "PASSED";

  function formatDateTime(iso: string) {
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${date} • ${time}`;
  }

  return (
    <div className="rounded-2xl border border-orange-200 p-5">
      <h3 className="text-sm font-bold text-slate-900">{stage.label}</h3>

      {loading && (
        <p className="mt-2 text-[13px] text-slate-500">
          Loading interview details...
        </p>
      )}

      {!loading && error && (
        <p className="mt-2 text-[13px] text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <>
          {/* No interview scheduled yet */}
          {!stage?.interview && (
            <p className="mt-2 text-[13px] text-slate-500">
              Your interview for this stage hasn't been scheduled yet.
            </p>
          )}

          {/* Interview scheduled, decision not made yet — show date/time only */}
          {stage?.interview && !isDecided && (
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <p className="text-[13px] font-semibold text-blue-700">
                Interview scheduled
              </p>
              <p className="mt-1 text-[13px] text-slate-600">
                {formatDateTime(stage?.interview?.scheduledAt)}
              </p>
              {stage?.interview.duration && (
                <p className="mt-1 text-[13px] text-slate-500">
                  Duration: {stage?.interview?.duration} minutes
                </p>
              )}

              {stage?.interview?._id && (
                <button
                  onClick={() =>
                    navigate(`/interview/${stage?.interview?._id}`)
                  }
                  className="group mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:translate-y-0"
                >
                  <Video
                    size={18}
                    className="transition-transform group-hover:scale-110"
                  />
                  Join Interview
                </button>
              )}
            </div>
          )}

          {/* Stage decision made — show result + feedback */}
          {stage?.interview && isDecided && (
            <div
              className={`mt-3 rounded-xl border p-4 ${
                isSelected
                  ? "border-emerald-100 bg-emerald-50/50"
                  : "border-red-100 bg-red-50/50"
              }`}
            >
              <p
                className={`text-[13px] font-semibold ${
                  isSelected ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {isSelected ? "Selected" : "Rejected"}
              </p>
              {applicationStage?.feedback && (
                <p className="mt-1 text-[13px] text-slate-600 whitespace-pre-wrap">
                  {applicationStage.feedback}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
