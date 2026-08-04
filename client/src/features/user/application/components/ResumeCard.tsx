const IconFolder: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M3.5 6.2c0-.7.6-1.2 1.2-1.2h4.4l1.6 1.9h8.6c.7 0 1.2.5 1.2 1.2v9.7c0 .7-.5 1.2-1.2 1.2H4.7c-.7 0-1.2-.5-1.2-1.2V6.2Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

interface ResumeCardProps {
  fileName: string;
  fileSize: string;
  onView?: () => void;
  onDownload?: () => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  fileName,
  fileSize,
  onView,
  onDownload,
}) => (
  <div className="mt-5 rounded-2xl border border-red-200 bg-white p-5">
    <p className="mb-3 text-sm font-semibold text-slate-800">Resume</p>

    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <IconFolder className="h-5 w-5 text-indigo-500" />
        <div>
          <p className="text-sm text-slate-700">{fileName}</p>
          <p className="text-xs text-slate-400">{fileSize}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onView}
          className="rounded-full bg-slate-200 px-5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300"
        >
          View
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="rounded-full bg-emerald-500 px-5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          Download
        </button>
      </div>
    </div>
  </div>
);
