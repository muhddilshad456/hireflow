import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
// ⚠️ Adjust these import paths to your project
import type { StageComponentProps } from "../StageRenderer";
import {
  getJobStageDetails,
  updateVerificationDocuments,
} from "../../services/applicatioServices";
import { ConfirmModal } from "../../../../shared/components/ConfirmationModal";

// "https://res.cloudinary.com/.../my%20id.pdf" -> "my id.pdf"
const fileNameFromUrl = (url: string, index: number) => {
  try {
    const last = decodeURIComponent(
      new URL(url).pathname.split("/").pop() ?? "",
    );
    return last || `Document ${index + 1}`;
  } catch {
    return `Document ${index + 1}`;
  }
};

export function DocumentVerificationStage({
  stage,
  application,
}: StageComponentProps) {
  const applicationId = application.applicationId;
  const jobStageId = stage.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [applicationStageId, setApplicationStageId] = useState("");
  const [status, setStatus] = useState("IN_PROGRESS");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJobStageDetails(applicationId, jobStageId);
      setApplicationStageId(res.data.applicationStage._id);
      setStatus(res.data.applicationStage.status);
      setDocuments(res.data.applicationStage.documents ?? []);
      setDescription(res.data.jobStage.documentVerificationDescription ?? "");
    } catch {
      setError("Failed to load document verification details.");
    } finally {
      setLoading(false);
    }
  }, [applicationId, jobStageId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  /* ---------- what the candidate is allowed to do ---------- */
  const isOpen = status === "IN_PROGRESS";
  const canAdd = isOpen && !!description; // needs the recruiter's instructions first
  const canDelete = isOpen;
  const busy = uploading || deleting;

  /* ---------- add (uploads immediately after choosing) ---------- */
  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // lets the same file be picked again later
    if (files.length === 0 || !applicationStageId) return;

    setUploading(true);
    try {
      const res = await updateVerificationDocuments(
        applicationStageId,
        documents,
        files,
      );
      setDocuments(res.data.documents);
      toast.success(
        files.length > 1 ? "Documents uploaded." : "Document uploaded.",
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to upload documents.",
      );
    } finally {
      setUploading(false);
    }
  };

  /* ---------- delete (after confirmation) ---------- */
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await updateVerificationDocuments(
        applicationStageId,
        documents.filter((url) => url !== pendingDelete),
        [],
      );
      setDocuments(res.data.documents);
      toast.success("Document deleted.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete document.");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-bold text-slate-900">{stage.label}</h3>

      {loading && (
        <p className="mt-2 text-[13px] text-slate-500">
          Loading document verification details...
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
          {/* ---------- recruiter's instructions ---------- */}
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Required documents
            </p>
            {description ? (
              <p className="mt-2 whitespace-pre-wrap text-[13px] text-slate-700">
                {description}
              </p>
            ) : (
              <p className="mt-2 text-[13px] text-slate-500">
                {isOpen
                  ? "The recruiter will add the required documents description here. You can add your documents after that."
                  : "No instructions were added for this stage."}
              </p>
            )}
          </div>

          {/* ---------- candidate's documents ---------- */}
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Your documents ({documents.length})
              </p>

              {canAdd && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={handleFilesSelected}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        Add document
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {documents.length === 0 ? (
              <p className="mt-2 text-[13px] text-slate-400">
                {canAdd
                  ? "You haven't added any documents yet."
                  : "No documents added."}
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {documents.map((url, i) => (
                  <li
                    key={url}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-blue-600 hover:underline"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {fileNameFromUrl(url, i)}
                      </span>
                    </a>

                    {canDelete && (
                      <button
                        onClick={() => setPendingDelete(url)}
                        disabled={busy}
                        aria-label="Delete document"
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete document"
        message="Do you want to delete this document?"
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setPendingDelete(null)}
      />
    </div>
  );
}
