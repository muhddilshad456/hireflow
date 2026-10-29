import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Download, Eye, FileText, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import type { StageComponentProps } from "../StageRenderer";
import {
  getJobStageDetails,
  updateOfferResponse,
} from "../../services/applicatioServices";
import type { OfferResponse } from "../../../../../types/offer/offer";
import { ConfirmModal } from "../../../../shared/components/ConfirmationModal";

const fileNameFromUrl = (url: string) => {
  try {
    const last = decodeURIComponent(
      new URL(url).pathname.split("/").pop() ?? "",
    );
    return last || "Offer letter";
  } catch {
    return "Offer letter";
  }
};

const toDownloadUrl = (url: string) =>
  url.includes("res.cloudinary.com") && url.includes("/upload/")
    ? url.replace("/upload/", "/upload/fl_attachment/")
    : url;

export function OfferStage({ stage, application }: StageComponentProps) {
  const applicationId = application.applicationId;
  const jobStageId = stage.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [applicationStageId, setApplicationStageId] = useState("");
  const [letterUrl, setLetterUrl] = useState("");
  const [response, setResponse] = useState<OfferResponse | null>(null);

  // The answer the candidate picked, waiting for confirmation in the modal
  const [pendingResponse, setPendingResponse] = useState<OfferResponse | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJobStageDetails(applicationId, jobStageId);
      const appStage = res.data.applicationStage;
      setApplicationStageId(appStage._id);
      setLetterUrl(appStage.offerLetterUrl ?? "");
      setResponse(appStage.offerResponse ?? null);
    } catch {
      setError("Failed to load your offer details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [applicationId, jobStageId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleConfirm = async () => {
    if (!pendingResponse || !applicationStageId) return;
    setSubmitting(true);
    try {
      const res = await updateOfferResponse(
        applicationStageId,
        pendingResponse,
      );
      setResponse(res.data.offerResponse);
      toast.success(
        pendingResponse === "ACCEPTED" ? "Offer accepted." : "Offer rejected.",
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to save your response.",
      );
      // The letter may have changed or the offer may already be answered: show the real state
      fetchDetails();
    } finally {
      setSubmitting(false);
      setPendingResponse(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-bold text-slate-900">{stage.label}</h3>

      {loading && (
        <p className="mt-2 text-[13px] text-slate-500">
          Loading your offer details...
        </p>
      )}

      {!loading && error && (
        <div className="mt-2">
          <p className="text-[13px] text-red-500">{error}</p>
          <button
            onClick={fetchDetails}
            className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* No letter yet */}
          {!letterUrl && (
            <p className="mt-2 text-[13px] text-slate-500">
              Your offer letter hasn't been sent yet. It will appear here once
              the recruiter uploads it.
            </p>
          )}

          {letterUrl && (
            <>
              {/* Offer letter card */}
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Offer letter
                    </p>
                    <p className="truncate text-[13px] font-medium text-slate-800">
                      {fileNameFromUrl(letterUrl)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-shrink-0 gap-2">
                  <a
                    href={letterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </a>
                  <a
                    href={toDownloadUrl(letterUrl)}
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </div>
              </div>

              {/* Already answered: show the result */}
              {response ? (
                <div
                  className={`mt-4 flex items-start gap-3 rounded-xl border p-4 ${
                    response === "ACCEPTED"
                      ? "border-emerald-100 bg-emerald-50/50"
                      : "border-red-100 bg-red-50/50"
                  }`}
                >
                  {response === "ACCEPTED" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  )}
                  <div>
                    <p
                      className={`text-[13px] font-semibold ${
                        response === "ACCEPTED"
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {response === "ACCEPTED"
                        ? "You accepted this offer"
                        : "You rejected this offer"}
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      Your response has been recorded and can't be changed.
                    </p>
                  </div>
                </div>
              ) : (
                /* Not answered yet: accept or reject */
                <div className="mt-4">
                  <p className="text-[13px] text-slate-600">
                    Please review your offer letter and let us know your
                    decision. This can't be changed later.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setPendingResponse("ACCEPTED")}
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Accept offer
                    </button>
                    <button
                      onClick={() => setPendingResponse("DECLINED")}
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject offer
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <ConfirmModal
        open={pendingResponse !== null}
        title={pendingResponse === "ACCEPTED" ? "Accept offer" : "Reject offer"}
        message={
          pendingResponse === "ACCEPTED"
            ? "Do you want to accept this offer? Your response is final and can't be changed."
            : "Do you want to reject this offer? Your response is final and can't be changed."
        }
        onConfirm={handleConfirm}
        onCancel={() => !submitting && setPendingResponse(null)}
      />
    </div>
  );
}
