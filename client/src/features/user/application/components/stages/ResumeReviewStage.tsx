import { ResumeCard } from "../ResumeCard";
import type { StageComponentProps } from "../StageRenderer";

export function ResumeReviewStage({ application }: StageComponentProps) {
  const { resumeFileName, resumeFileSize, resumeUrl } = application;

  if (!resumeUrl) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500">No resume uploaded</p>
      </div>
    );
  }

  const handleView = () => {
    window.open(resumeUrl, "_blank");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.download = resumeFileName;
    link.click();
  };

  return (
    <ResumeCard
      fileName={resumeFileName}
      fileSize={resumeFileSize}
      onView={handleView}
      onDownload={handleDownload}
    />
  );
}
