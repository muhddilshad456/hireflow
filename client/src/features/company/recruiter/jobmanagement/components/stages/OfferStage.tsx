import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CheckCircle2, FileText, Loader2, Upload, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import type { JobLayoutOutletContext } from "../../pages/JobDetailsLayout";
import type { StageDetail } from "../StageRenderer";
import { updateJobApplicationStage } from "../../services/jobServices";
import { uploadOfferLetter } from "../../services/offerServices";

interface StageComponentProps {
  stage: StageDetail;
}

const toTitleCase = (raw: string) =>
  raw
    .replace(/[_-]/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const Badge = ({ label, cls }: { label: string; cls: string }) => (
  <span
    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}
  >
    {label}
  </span>
);

// What the candidate has done with the offer
const OfferStatusBadge = ({
  letterSent,
  response,
}: {
  letterSent: boolean;
  response?: string;
}) => {
  if (response === "ACCEPTED") {
    return (
      <Badge label="Offer accepted" cls="bg-emerald-50 text-emerald-600" />
    );
  }
  if (response === "DECLINED") {
    return <Badge label="Offer declined" cls="bg-red-50 text-red-500" />;
  }
  if (letterSent) {
    return <Badge label="Awaiting response" cls="bg-amber-50 text-amber-600" />;
  }
  return (
    <Badge label="Offer letter not sent" cls="bg-gray-100 text-gray-500" />
  );
};

export function OfferStage({ stage }: StageComponentProps) {
  const { refetchJob } = useOutletContext<JobLayoutOutletContext>();

  // Letter URLs uploaded in this session, so the card updates immediately
  const [letterUrls, setLetterUrls] = useState<Record<string, string>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  // One hidden file input shared by every card; we remember which card opened it
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<string | null>(null);

  if (stage.candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 p-5 text-center text-[13px] text-slate-500">
        No applications in this stage yet.
      </div>
    );
  }

  const chooseFile = (applicationStageId: string) => {
    uploadTargetRef.current = applicationStageId;
    fileInputRef.current?.click();
  };

  // Uploads right after the file is chosen
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const applicationStageId = uploadTargetRef.current;
    e.target.value = ""; // lets the same file be chosen again later
    uploadTargetRef.current = null;
    if (!file || !applicationStageId) return;

    setUploadingId(applicationStageId);
    try {
      const res = await uploadOfferLetter(applicationStageId, file);
      setLetterUrls((prev) => ({
        ...prev,
        [applicationStageId]: res.data.offerLetterUrl,
      }));
      toast.success("Offer letter uploaded.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to upload offer letter.",
      );
    } finally {
      setUploadingId(null);
    }
  };

  const handleDecision = async (
    applicationStageId: string,
    decision: "PASSED" | "FAILED",
  ) => {
    setDecidingId(applicationStageId);
    try {
      await updateJobApplicationStage(applicationStageId, decision);
      toast.success(
        decision === "PASSED"
          ? "Candidate passed the offer stage."
          : "Candidate rejected.",
      );
      await refetchJob();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Something went wrong.");
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <>
      <h3 className="text-sm font-semibold text-gray-900">
        {toTitleCase(stage.name)}
      </h3>

      {/* Shared hidden file input (add an `accept` attribute here if you want to limit file types) */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileSelected}
      />

      <div className="mt-2">
        {stage.candidates.map((c) => {
          const id = c.applicationStage?._id;
          if (!c.application || !id) return null;

          const name = c.application.userId?.name ?? "Unknown candidate";
          // ⚠️ offerLetterUrl / offerResponse must exist on your ApplicationStageDetail type
          const letterUrl =
            letterUrls[id] ?? c.applicationStage?.offerLetterUrl;
          const response = c.applicationStage?.offerResponse;

          const isOpen = c.status === "IN_PROGRESS";
          const canUpload = isOpen && !response; // the candidate's answer is final
          const uploading = uploadingId === id;
          const deciding = decidingId === id;

          return (
            <div
              key={id}
              className="border-b border-gray-100 py-6 last:border-b-0"
            >
              {/* name + offer status */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {name}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Applied{" "}
                    {c.application.appliedAt
                      ? new Date(c.application.appliedAt).toLocaleDateString(
                          "en-IN",
                        )
                      : "—"}
                  </p>
                </div>
                <OfferStatusBadge
                  letterSent={!!letterUrl}
                  response={response}
                />
              </div>

              {/* offer letter */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {letterUrl && (
                  <a
                    href={letterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-gray-50"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View offer letter
                  </a>
                )}

                {canUpload && (
                  <button
                    onClick={() => chooseFile(id)}
                    disabled={uploadingId !== null}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        {letterUrl
                          ? "Replace offer letter"
                          : "Upload offer letter"}
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* decision */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {isOpen ? (
                  <>
                    <button
                      onClick={() => handleDecision(id, "PASSED")}
                      disabled={deciding}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {deciding ? "Saving..." : "Pass"}
                    </button>
                    <button
                      onClick={() => handleDecision(id, "FAILED")}
                      disabled={deciding}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Fail
                    </button>
                  </>
                ) : c.status === "PASSED" ? (
                  <Badge label="Passed" cls="bg-emerald-50 text-emerald-600" />
                ) : (
                  <Badge label="Failed" cls="bg-red-50 text-red-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
