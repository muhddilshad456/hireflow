import { useEffect, useState } from "react";
import type { StageComponentProps } from "../StageRenderer";
import {
  addOrEditAssessmentResponse,
  getJobStageDetails,
} from "../../services/applicatioServices";

interface JobStageData {
  assessmentTaskDescription?: string;
  assessmentTaskAttachmentUrl?: string;
}

interface ApplicationStageData {
  status: "IN_PROGRESS" | "PASSED" | "FAILED";
  assessmentResponseText?: string;
  assessmentResponseAttachmentUrl?: string;
  assessmentSubmittedAt?: string;
}

export function AssessmentStage({ stage, application }: StageComponentProps) {
  const applicationId = application.applicationId;
  const jobStageId = stage.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobStage, setJobStage] = useState<JobStageData | null>(null);
  const [applicationStage, setApplicationStage] =
    useState<ApplicationStageData | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJobStageDetails(applicationId, jobStageId);
      console.log("res of fetch assessment stage details : ", res);
      setJobStage(res.data.jobStage);
      setApplicationStage(res.data.applicationStage);
      setText(res.data.applicationStage?.assessmentResponseText ?? "");
    } catch (err) {
      setError("Failed to load assessment details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, jobStageId]);

  const isLocked =
    applicationStage?.status === "PASSED" ||
    applicationStage?.status === "FAILED";

  const hasResponse =
    !!applicationStage?.assessmentResponseText ||
    !!applicationStage?.assessmentResponseAttachmentUrl;

  const handleSubmit = async () => {
    if (!text.trim() && !file) {
      setError("Please add a text response or upload a file.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (file) formData.append("file", file);

      let res = await addOrEditAssessmentResponse(
        applicationId,
        jobStageId,
        formData,
      );
      console.log("result of add or edit assessment response : ", res);
      setIsEditing(false);
      setFile(null);
      await fetchDetails();
    } catch (err) {
      setError("Failed to save your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-orange-200 p-5">
      <h3 className="text-sm font-bold text-slate-900">{stage.label}</h3>

      {loading && (
        <p className="mt-2 text-[13px] text-slate-500">
          Loading assessment details...
        </p>
      )}

      {!loading && error && (
        <p className="mt-2 text-[13px] text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <>
          {/* Task section */}
          {!jobStage?.assessmentTaskDescription ? (
            <p className="mt-2 text-[13px] text-slate-500">
              The recruiter hasn't added an assessment task for this stage yet.
              Please check back later.
            </p>
          ) : (
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <p className="text-[13px] font-semibold text-blue-700">Task</p>
              <p className="mt-1 text-[13px] text-slate-600 whitespace-pre-wrap">
                {jobStage.assessmentTaskDescription}
              </p>
              {jobStage.assessmentTaskAttachmentUrl && (
                <a
                  href={jobStage.assessmentTaskAttachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[13px] font-medium text-blue-600 hover:underline"
                >
                  View task attachment
                </a>
              )}
            </div>
          )}

          {/* Response section — only relevant once a task exists */}
          {jobStage?.assessmentTaskDescription && (
            <div className="mt-4">
              {isLocked && (
                <p className="text-[13px] text-slate-500">
                  This stage has already been reviewed by the recruiter. You can
                  no longer add or change your response.
                </p>
              )}

              {!isLocked && !isEditing && (
                <>
                  {hasResponse ? (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                      <p className="text-[13px] font-semibold text-emerald-700">
                        Your response
                      </p>
                      {applicationStage?.assessmentResponseText && (
                        <p className="mt-1 text-[13px] text-slate-600 whitespace-pre-wrap">
                          {applicationStage.assessmentResponseText}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3">
                        {applicationStage?.assessmentResponseAttachmentUrl && (
                          <a
                            href={
                              applicationStage.assessmentResponseAttachmentUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-[13px] font-medium text-emerald-700 hover:underline"
                          >
                            View uploaded file
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit response
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[13px] text-slate-500">
                        You haven't submitted a response for this task yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-slate-800"
                      >
                        Add response
                      </button>
                    </div>
                  )}
                </>
              )}

              {!isLocked && isEditing && (
                <div className="rounded-xl border border-slate-100 p-4">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write your response here..."
                    rows={5}
                    className="w-full rounded-lg border border-slate-200 p-3 text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />

                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="mt-3 text-[13px] text-slate-600"
                  />

                  {applicationStage?.assessmentResponseAttachmentUrl &&
                    !file && (
                      <p className="mt-1 text-[12px] text-slate-400">
                        Leave empty to keep your previously uploaded file.
                      </p>
                    )}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : "Save response"}
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        setIsEditing(false);
                        setFile(null);
                        setText(applicationStage?.assessmentResponseText ?? "");
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
