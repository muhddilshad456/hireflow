import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CheckCircle2, FileText, Pencil, Plus, XCircle } from "lucide-react";
import toast from "react-hot-toast";
// ⚠️ Adjust these import paths to your project
import type { JobLayoutOutletContext } from "../../pages/JobDetailsLayout";
import type { StageDetail } from "../StageRenderer";
import {
  setDocumentVerificationDescription,
  updateJobApplicationStage,
} from "../../services/jobServices";

interface StageComponentProps {
  stage: StageDetail;
}

const MAX_DESCRIPTION_LENGTH = 1000;

const toTitleCase = (raw: string) =>
  raw
    .replace(/[_-]/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

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

const StatusBadge = ({ status }: { status: string }) => {
  const config =
    status === "PASSED"
      ? { label: "Passed", cls: "bg-emerald-50 text-emerald-600" }
      : status === "FAILED"
        ? { label: "Failed", cls: "bg-red-50 text-red-500" }
        : { label: "In progress", cls: "bg-amber-50 text-amber-600" };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${config.cls}`}
    >
      {config.label}
    </span>
  );
};

export function DocumentVerificationStage({ stage }: StageComponentProps) {
  console.log("stage : ", stage);
  const { refetchJob } = useOutletContext<JobLayoutOutletContext>();

  /* ---------- description (inline view / add / edit) ---------- */
  const [description, setDescription] = useState(
    stage.documentVerificationDescription ?? "",
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [savingDescription, setSavingDescription] = useState(false);

  // Keep in sync if the stage data is reloaded (but never overwrite an open edit)
  useEffect(() => {
    if (!isEditing) setDescription(stage.documentVerificationDescription ?? "");
  }, [stage.documentVerificationDescription, isEditing]);

  const startEditing = () => {
    setDraft(description);
    setIsEditing(true);
  };

  const handleSaveDescription = async () => {
    const text = draft.trim();
    if (!text) return;
    setSavingDescription(true);
    try {
      await setDocumentVerificationDescription(stage._id, text);
      setDescription(text);
      setIsEditing(false);
      toast.success("Instructions saved.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to save instructions.",
      );
    } finally {
      setSavingDescription(false);
    }
  };

  /* ---------- pass / fail ---------- */
  const [busyId, setBusyId] = useState<string | null>(null);
  const [failingId, setFailingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const handlePass = async (applicationStageId: string) => {
    setBusyId(applicationStageId);
    try {
      await updateJobApplicationStage(applicationStageId, "PASSED");
      toast.success("Candidate moved to the next round.");
      await refetchJob();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmFail = async (applicationStageId: string) => {
    const feedback = reason.trim();
    if (!feedback) return;
    setBusyId(applicationStageId);
    try {
      await updateJobApplicationStage(applicationStageId, "FAILED", feedback);
      toast.success("Candidate rejected.");
      setFailingId(null);
      setReason("");
      await refetchJob();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-bold text-slate-900">
        {toTitleCase(stage.name)}
      </h3>

      {/* ---------- instructions ---------- */}
      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Instructions for candidates
          </p>
          {!isEditing && (
            <button
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {description ? (
                <>
                  <Pencil className="h-3 w-3" /> Edit
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" /> Add
                </>
              )}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="mt-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={4}
              autoFocus
              placeholder="Tell candidates which documents to upload (e.g. ID proof, degree certificate)…"
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                {draft.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={savingDescription}
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={
                    savingDescription ||
                    !draft.trim() ||
                    draft.trim() === description
                  }
                  onClick={handleSaveDescription}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  {savingDescription ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : description ? (
          <p className="mt-2 whitespace-pre-wrap text-[13px] text-slate-700">
            {description}
          </p>
        ) : (
          <p className="mt-2 text-[13px] text-slate-400">
            No instructions added yet. Candidates won't know which documents to
            upload.
          </p>
        )}
      </div>

      {/* ---------- candidates ---------- */}
      {stage.candidates.length === 0 ? (
        <p className="mt-4 text-[13px] text-slate-500">
          No candidates to verify yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {stage.candidates.map((c) => {
            const id = c._id; // same as applicationStage._id
            const docs: string[] = c.applicationStage?.documents ?? [];
            const isOpen = c.status === "IN_PROGRESS";
            const busy = busyId === id;
            const failing = failingId === id;

            return (
              <div
                key={id}
                className="rounded-xl border border-gray-100 px-4 py-3"
              >
                {/* name + status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {c.application?.userId?.name ?? "—"}
                  </span>
                  <StatusBadge status={c.status} />
                </div>

                {/* submitted documents */}
                <div className="mt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Submitted documents ({docs.length})
                  </p>
                  {docs.length === 0 ? (
                    <p className="mt-1 text-[13px] text-slate-400">
                      No documents submitted yet.
                    </p>
                  ) : (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {docs.map((url, i) => (
                        <li key={url}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-[220px] items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-slate-50"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {fileNameFromUrl(url, i)}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* decision */}
                {isOpen ? (
                  failing ? (
                    <div className="mt-4">
                      <label className="text-[12px] font-medium text-slate-700">
                        Reason for rejecting
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        autoFocus
                        placeholder="Explain why the documents were not accepted…"
                        className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          disabled={busy}
                          onClick={() => {
                            setFailingId(null);
                            setReason("");
                          }}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={busy || !reason.trim()}
                          onClick={() => handleConfirmFail(id)}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          {busy ? "Rejecting..." : "Confirm reject"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <button
                        disabled={busy}
                        onClick={() => handlePass(id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {busy ? "Passing..." : "Pass"}
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => {
                          setFailingId(id);
                          setReason("");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Fail
                      </button>
                    </div>
                  )
                ) : (
                  c.applicationStage?.feedback && (
                    <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-[13px] text-slate-600">
                      <span className="font-semibold text-slate-700">
                        Feedback:{" "}
                      </span>
                      {c.applicationStage.feedback}
                    </p>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
