import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import {
  FileText,
  MessageCircle,
  User as UserIcon,
  Plus,
  X,
  Paperclip,
  Pencil,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import type { JobLayoutOutletContext } from "../../pages/JobDetailsLayout";
import type { StageDetail } from "../StageRenderer";
import {
  updateAssessmentTask,
  updateJobApplicationStage,
} from "../../services/jobServices";
import toast from "react-hot-toast";

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

const ACCEPTED_TYPES = "application/pdf,image/*";

/* ------------------------------------------------------------------ */
/*  Create / Edit Assessment Modal                                    */
/* ------------------------------------------------------------------ */

interface AssessmentModalProps {
  onClose: () => void;
  onCreated: () => Promise<void>;
  stageId: string;
  initialDescription?: string;
  initialAttachmentUrl?: string;
  isEditing?: boolean;
}

function AssessmentModal({
  onClose,
  onCreated,
  stageId,
  initialDescription = "",
  initialAttachmentUrl = "",
  isEditing = false,
}: AssessmentModalProps) {
  const [description, setDescription] = useState(initialDescription);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { jobId } = useOutletContext<JobLayoutOutletContext>();

  const handleSubmit = async () => {
    if (!description.trim() && !file && !initialAttachmentUrl) {
      setError("Please add a description or file.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (file) {
        formData.append("file", file);
      }

      await updateAssessmentTask(jobId, stageId, formData);
      await onCreated();
      onClose();
    } catch (err: any) {
      console.error(err?.response);
      setError("Couldn't save the assessment task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            {isEditing ? "Edit Assessment Task" : "Create Assessment Task"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the assessment — questions, instructions, time limit..."
            rows={5}
            className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-gray-400"
          />
        </div>

        <div className="mt-3">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50">
            <Paperclip className="h-3.5 w-3.5" />
            {file
              ? file.name
              : initialAttachmentUrl
                ? "Replace Attachment"
                : "Attach PDF or image"}
            <input
              type="file"
              accept={ACCEPTED_TYPES}
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {file ? (
            <button
              onClick={() => setFile(null)}
              className="ml-2 text-xs text-gray-400 transition hover:text-gray-600"
            >
              Remove
            </button>
          ) : initialAttachmentUrl ? (
            <a
              href={initialAttachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
            >
              Current attachment <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : isEditing
                ? "Update Assessment"
                : "Create Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AssessmentStage Component                                         */
/* ------------------------------------------------------------------ */

export function AssessmentStage({ stage }: StageComponentProps) {
  const { refetchJob } = useOutletContext<JobLayoutOutletContext>();
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const hasTask = Boolean(
    stage.assessmentTaskDescription || stage.assessmentTaskAttachmentUrl,
  );

  const handleViewCV = (resumeUrl?: string) => {
    if (resumeUrl) window.open(resumeUrl, "_blank");
  };

  const handleAccept = async (applicationStageId: string | null) => {
    if (!applicationStageId) return;
    try {
      setUpdatingId(applicationStageId);
      await updateJobApplicationStage(applicationStageId, "PASSED");
      toast.success("Candidate Moved To Next Round.");
      await refetchJob();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Something went wrong.");
      console.log(err?.response);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (applicationStageId: string | null) => {
    if (!applicationStageId) return;
    try {
      setUpdatingId(applicationStageId);
      await updateJobApplicationStage(applicationStageId, "FAILED");
      toast.success("Candidate Rejected.");
      await refetchJob();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Something went wrong.");
      console.log(err?.response);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stage Header & Assessment Task Overview */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            {toTitleCase(stage.name)}
          </h3>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            {hasTask ? (
              <>
                <Pencil className="h-3.5 w-3.5" /> Edit Assessment
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Create Assessment
              </>
            )}
          </button>
        </div>

        {/* Task Details Card */}
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
          {hasTask ? (
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Task Instructions
                </p>
                <p className="mt-1 whitespace-pre-line text-xs text-gray-700">
                  {stage.assessmentTaskDescription ||
                    "No description provided."}
                </p>
              </div>

              {stage.assessmentTaskAttachmentUrl && (
                <div className="pt-1">
                  <a
                    href={stage.assessmentTaskAttachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    <Paperclip className="h-3.5 w-3.5 text-slate-500" />
                    View Task Attachment
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-400">
              No assessment task added yet. Click &quot;Create Assessment&quot;
              above to add one.
            </p>
          )}
        </div>
      </div>

      {/* Candidates List & Submissions */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Candidates ({stage.candidates.length})
        </h4>

        {stage.candidates.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 p-5 text-center text-[13px] text-slate-500">
            No applications in this stage yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stage.candidates.map((c) => {
              const name = c.application?.userId?.name ?? "Unknown candidate";
              const appStage = c.applicationStage;
              const appStageId = appStage?._id;

              const responseText = appStage?.assessmentResponseText;
              const responseFileUrl = appStage?.assessmentResponseAttachmentUrl;
              const submittedAt = appStage?.assessmentSubmittedAt;
              const hasResponse = Boolean(
                responseText || responseFileUrl || submittedAt,
              );

              const isUpdating = updatingId === appStageId;
              const isDecided = c.status === "PASSED" || c.status === "FAILED";

              return (
                <div
                  key={appStageId}
                  className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {name}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Applied{" "}
                        {c.application?.appliedAt
                          ? new Date(
                              c.application.appliedAt,
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </p>
                    </div>

                    {/* Candidate Response Panel */}
                    <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600">
                          Candidate Response
                        </span>
                        {hasResponse ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            <CheckCircle className="h-3 w-3" /> Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                      </div>

                      {hasResponse ? (
                        <div className="space-y-2 text-xs text-slate-700">
                          {submittedAt && (
                            <p className="text-[11px] text-slate-500">
                              Submitted on{" "}
                              {new Date(submittedAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          )}

                          {responseText ? (
                            <p className="whitespace-pre-line rounded-md border border-slate-200 bg-white p-2 text-[11px]">
                              {responseText}
                            </p>
                          ) : (
                            <p className="text-[11px] italic text-slate-400">
                              No written description provided.
                            </p>
                          )}

                          {responseFileUrl ? (
                            <a
                              href={responseFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 font-medium text-emerald-600 hover:underline"
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                              View Response Attachment
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <p className="text-[11px] italic text-slate-400">
                              No file attached.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] italic text-slate-400">
                          Candidate has not submitted a response for this
                          assessment yet.
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleViewCV(c.application?.resumeUrl)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <FileText className="h-3.5 w-3.5" /> View CV
                      </button>
                      <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50">
                        <MessageCircle className="h-3.5 w-3.5" /> Chat
                      </button>

                      {isDecided ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            c.status === "PASSED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {c.status === "PASSED" ? (
                            <CheckCircle className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {c.status === "PASSED" ? "Passed" : "Failed"}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAccept(appStageId)}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {isUpdating ? "Updating..." : "Pass"}
                          </button>
                          <button
                            onClick={() => handleReject(appStageId)}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            {isUpdating ? "Updating..." : "Fail"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex h-20 w-full items-center justify-center rounded-xl bg-orange-100 sm:h-20 sm:w-32">
                    <UserIcon
                      className="h-8 w-8 text-gray-400"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Creating / Editing Assessment Task */}
      {modalOpen && (
        <AssessmentModal
          onClose={() => setModalOpen(false)}
          onCreated={refetchJob}
          stageId={stage._id}
          initialDescription={stage.assessmentTaskDescription}
          initialAttachmentUrl={stage.assessmentTaskAttachmentUrl}
          isEditing={hasTask}
        />
      )}
    </div>
  );
}
