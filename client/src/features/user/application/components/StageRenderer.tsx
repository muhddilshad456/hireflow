import { useParams, useOutletContext } from "react-router-dom";
import type { AppliedJobData } from "../pages/ApplicationLayout";
import { ResumeCard } from "./ResumeCard";

/* --------------------------- Stage component registry --------------------------- */
/* Keyed by the raw API stage name. Add one entry here per new stage type —
   this is the ONLY file that needs to change when a new stage type ships. */

interface StageComponentProps {
  stage: AppliedJobData["stages"][number];
  application: AppliedJobData;
}

function ResumeReviewStage({ application }: StageComponentProps) {
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

function AssessmentStage({ stage }: StageComponentProps) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-bold text-slate-900">{stage.label}</h3>
      <p className="mt-2 text-[13px] text-slate-500">
        Assessment details for this stage will appear here.
      </p>
    </div>
  );
}

function DocumentVerificationStage({ stage }: StageComponentProps) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-bold text-slate-900">{stage.label}</h3>
      <p className="mt-2 text-[13px] text-slate-500">
        Document verification details for this stage will appear here.
      </p>
    </div>
  );
}

const STAGE_REGISTRY: Record<
  string,
  React.ComponentType<StageComponentProps>
> = {
  resume_review: ResumeReviewStage,
  assessment: AssessmentStage,
  document_verification: DocumentVerificationStage,
};

/* --------------------------- StageRenderer --------------------------- */

export function StageRenderer() {
  const { stageId } = useParams<{ stageId: string }>();
  const { application } = useOutletContext<{ application: AppliedJobData }>();

  const stage = application.stages.find((s) => s.id === stageId);

  if (!stage) {
    return (
      <div className="mt-5 rounded-2xl border border-slate-100 p-5 text-center text-[13px] text-slate-500">
        Stage not found.
      </div>
    );
  }

  const Component = STAGE_REGISTRY[stage.name];

  if (!Component) {
    return (
      <div className="mt-5 rounded-2xl border border-slate-100 p-5 text-center text-[13px] text-slate-500">
        No view configured yet for "{stage.label}".
      </div>
    );
  }

  return (
    <div className="mt-5">
      <Component stage={stage} application={application} />
    </div>
  );
}
