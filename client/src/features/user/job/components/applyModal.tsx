import React, { useEffect, useState } from "react";
import { X, FileText, Upload, Check, Loader2 } from "lucide-react";
import { applyJob } from "../services/userJobService";
import { fetchProfile } from "../../../shared/services/profileService";
import { uploadFile } from "../../../shared/services/uploadService";
import toast from "react-hot-toast";

// ---- Types ----

interface ResumeItem {
  url: string; // cloudinary string
  _id?: string; // present if your backend stores resumes as subdocs, optional if plain string array
}

interface CoverLetterItem {
  _id?: string;
  title?: string;
  content: string;
}

interface ApplyModalProps {
  isOpen: boolean;
  jobId: string;
  onClose: () => void;
  onApplied?: () => void;
}

// ---- Helpers ----

// Cloudinary urls look like: https://res.cloudinary.com/<cloud>/raw/upload/v123456/resumes/john_resume.pdf
function getFileNameFromUrl(url: string): string {
  try {
    const withoutQuery = url.split("?")[0];
    const parts = withoutQuery.split("/");
    const last = parts[parts.length - 1];
    return decodeURIComponent(last);
  } catch {
    return "Resume";
  }
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  jobId,
  onClose,
  onApplied,
}) => {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetterItem[]>([]);

  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string | null>(
    null,
  );
  const [newResumeFile, setNewResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [coverLetterMode, setCoverLetterMode] = useState<
    "select" | "write" | "none"
  >("none");
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<
    string | null
  >(null);
  const [customCoverLetter, setCustomCoverLetter] = useState("");

  // Fetch profile resumes + cover letters when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const getProfile = async () => {
      setLoadingProfile(true);
      setError(null);
      try {
        const result = await fetchProfile();
        const profile = result.data.profile;

        // Normalize resumes: backend may return string[] or {url,_id}[]
        const rawResumes = profile?.resumes ?? [];
        const normalizedResumes: ResumeItem[] = rawResumes.map((r: any) =>
          typeof r === "string" ? { url: r } : { url: r.url, _id: r._id },
        );
        setResumes(normalizedResumes);

        const rawCoverLetters = profile?.coverLetters ?? [];
        setCoverLetters(rawCoverLetters);

        if (normalizedResumes.length > 0) {
          setSelectedResumeUrl(normalizedResumes[0].url);
        }
        if (rawCoverLetters.length > 0) {
          setCoverLetterMode("select");
          setSelectedCoverLetterId(rawCoverLetters[0]._id ?? null);
        } else {
          setCoverLetterMode("write");
        }
      } catch (err: any) {
        console.log(err?.response?.data);
        setError("Failed to load your profile. Please try again.");
      } finally {
        setLoadingProfile(false);
      }
    };

    getProfile();
  }, [isOpen]);

  // Reset state on close so reopening is fresh
  useEffect(() => {
    if (!isOpen) {
      setNewResumeFile(null);
      setCustomCoverLetter("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNewResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewResumeFile(file);
      setSelectedResumeUrl(null); // uploading a new one takes priority
    }
  };

  const getFinalCoverLetterText = (): string => {
    if (coverLetterMode === "select" && selectedCoverLetterId) {
      const match = coverLetters.find((c) => c._id === selectedCoverLetterId);
      return match?.content ?? "";
    }
    if (coverLetterMode === "write") {
      return customCoverLetter.trim();
    }
    return "";
  };

  const handleSubmit = async () => {
    setError(null);

    let resumeUrlToSubmit = selectedResumeUrl;

    if (newResumeFile) {
      try {
        setUploadingResume(true);
        const formData = new FormData();
        if (newResumeFile) {
          formData.append("file", newResumeFile);
        }
        const uploadResult = await uploadFile(formData);

        resumeUrlToSubmit = uploadResult.data; // adjust to match your upload API response shape
      } catch (err: any) {
        console.log(err?.response?.data);
        setError("Failed to upload resume. Please try again.");
        setUploadingResume(false);
        return;
      } finally {
        setUploadingResume(false);
      }
    }

    if (!resumeUrlToSubmit) {
      setError("Please select or upload a resume.");
      return;
    }

    const coverLetterText = getFinalCoverLetterText();

    try {
      setSubmitting(true);

      await applyJob(jobId, {
        data: {
          resumeUrl: resumeUrlToSubmit,
          coverLetter: coverLetterText,
        },
      });
      toast.success("Application submitted");
      onClose();
    } catch (err: any) {
      console.log(err?.response?.data);
      toast.error(
        err?.response?.data?.message ?? "Failed to submit application.",
      );
      setError(err?.response?.data?.message ?? "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-display font-semibold text-lg text-gray-900">
            Apply for this job
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {loadingProfile ? (
            <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading your profile...</span>
            </div>
          ) : (
            <>
              {/* Resume section */}
              <div className="mb-6">
                <h3 className="text-[14px] font-semibold text-gray-800 mb-3">
                  Select Resume
                </h3>

                {resumes.length > 0 ? (
                  <div className="flex flex-col gap-2 mb-3">
                    {resumes.map((resume) => {
                      const isSelected =
                        selectedResumeUrl === resume.url && !newResumeFile;
                      return (
                        <button
                          key={resume._id ?? resume.url}
                          onClick={() => {
                            setSelectedResumeUrl(resume.url);
                            setNewResumeFile(null);
                          }}
                          className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-left transition-colors ${
                            isSelected
                              ? "border-orange-400 bg-orange-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                            <span className="text-[13px] text-gray-700 truncate">
                              {getFileNameFromUrl(resume.url)}
                            </span>
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-orange-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-400 mb-3">
                    No resumes found in your profile.
                  </p>
                )}

                {/* Upload new resume */}
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-gray-300 text-gray-500 text-[13px] cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  {newResumeFile
                    ? newResumeFile.name
                    : "Upload a different resume"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleNewResumeChange}
                  />
                </label>
              </div>

              {/* Cover letter section */}
              <div className="mb-2">
                <h3 className="text-[14px] font-semibold text-gray-800 mb-3">
                  Cover Letter
                </h3>

                {coverLetters.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setCoverLetterMode("select")}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                        coverLetterMode === "select"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      Use saved
                    </button>
                    <button
                      onClick={() => setCoverLetterMode("write")}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                        coverLetterMode === "write"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      Write new
                    </button>
                  </div>
                )}

                {coverLetterMode === "select" && coverLetters.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {coverLetters.map((cl, idx) => {
                      const id = cl._id ?? String(idx);
                      const isSelected =
                        selectedCoverLetterId === (cl._id ?? id);
                      return (
                        <button
                          key={id}
                          onClick={() => setSelectedCoverLetterId(cl._id ?? id)}
                          className={`text-left px-4 py-2.5 rounded-lg border transition-colors ${
                            isSelected
                              ? "border-orange-400 bg-orange-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <p className="text-[13px] font-medium text-gray-800 mb-1">
                            {cl.title ?? `Cover Letter ${idx + 1}`}
                          </p>
                          <p className="text-[12px] text-gray-500 line-clamp-2">
                            {cl.content}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {coverLetterMode === "write" && (
                  <textarea
                    value={customCoverLetter}
                    onChange={(e) => setCustomCoverLetter(e.target.value)}
                    placeholder="Write a short cover letter for this application..."
                    rows={6}
                    className="w-full text-[13px] text-gray-700 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  />
                )}
              </div>

              {error && (
                <p className="text-[13px] text-red-500 mt-3">{error}</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || uploadingResume || loadingProfile}
            className="px-5 py-2 rounded-md text-[13px] font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {(submitting || uploadingResume) && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            {uploadingResume
              ? "Uploading resume..."
              : submitting
                ? "Submitting..."
                : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
};
