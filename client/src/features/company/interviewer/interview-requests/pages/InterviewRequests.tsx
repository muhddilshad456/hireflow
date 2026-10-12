import { useEffect, useState } from "react";
import type {
  InterviewRequestListItem,
  InterviewRequestStatus,
} from "../../../../../types/interview/interviewReq";
import {
  getMyInterviewRequests,
  updateInterviewRequestDecision,
} from "../services/interviewReqServices";
import toast from "react-hot-toast";

const LIMIT = 6;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Requests" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

function formatStageName(name: string) {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

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

function StatusBadge({ status }: { status: InterviewRequestStatus }) {
  const styles: Record<InterviewRequestStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    ACCEPTED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-600",
    CANCELLED: "bg-slate-200 text-slate-600",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function DeclineReasonModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
        <h4 className="text-sm font-semibold text-gray-900">
          Reason for declining
        </h4>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Let the recruiter know why you're declining..."
          className="mt-3 w-full rounded-lg border border-gray-200 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-red-300"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Confirm decline
          </button>
        </div>
      </div>
    </div>
  );
}

export function InterviewRequestsPage() {
  const [requests, setRequests] = useState<InterviewRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [declineTargetId, setDeclineTargetId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyInterviewRequests({
        status: status || undefined,
        page,
        limit: LIMIT,
      });
      setRequests(result.requests);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      console.log(error?.response);
      setError("Failed to load interview requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const handleAccept = async (id: string) => {
    try {
      await updateInterviewRequestDecision(id, "ACCEPTED");
      fetchRequests();
      toast.success("Interview Request Accepted.");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to accept the request. Please try again.",
      );
    }
  };

  const handleDeclineConfirm = async (reason: string) => {
    if (!declineTargetId) return;
    try {
      await updateInterviewRequestDecision(declineTargetId, "REJECTED", reason);
      setDeclineTargetId(null);
      fetchRequests();
      toast.success("Interview Request Rejected.");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to accept the request. Please try again.",
      );
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header row: title left, filter right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Interview Requests
        </h1>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 sm:w-auto"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="mt-5 space-y-4">
        {loading && (
          <p className="py-8 text-center text-sm text-slate-400">
            Loading interview requests...
          </p>
        )}

        {!loading && error && (
          <p className="py-8 text-center text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && requests.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            No interview requests found.
          </p>
        )}

        {!loading &&
          !error &&
          requests.map((r) => (
            <div
              key={r._id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Candidate info */}
              <div className="min-w-0 sm:w-1/4">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-bold text-slate-900">
                    {r.application.candidate.name}
                  </h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-0.5 truncate text-[13px] text-slate-500">
                  {r.application.job.title}
                </p>
              </div>

              {/* Stage + date + resume */}
              <div className="sm:w-1/3">
                <p className="text-[13px] font-medium text-blue-600">
                  {formatStageName(r.jobStage.name)}
                </p>
                <p className="mt-1 text-[13px] text-slate-500">
                  {formatDateTime(r.scheduledAt)}
                </p>
                <a
                  href={r.application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-[13px] font-medium text-blue-600 hover:underline"
                >
                  View Resume
                </a>
              </div>

              {/* Actions */}
              {r.status === "PENDING" ? (
                <div className="flex gap-2 sm:flex-col sm:items-stretch sm:w-40">
                  <button
                    onClick={() => handleAccept(r._id)}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 sm:flex-none"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setDeclineTargetId(r._id)}
                    className="flex-1 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 sm:flex-none"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <div className="sm:w-40" />
              )}
            </div>
          ))}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          >
            {"<"}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                p === page
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          >
            {">"}
          </button>
        </div>
      )}

      <DeclineReasonModal
        open={!!declineTargetId}
        onClose={() => setDeclineTargetId(null)}
        onConfirm={handleDeclineConfirm}
      />
    </div>
  );
}
