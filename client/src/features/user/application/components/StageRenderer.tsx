import { useParams, useOutletContext } from "react-router-dom";
import type { AppliedJobData } from "../pages/ApplicationLayout";
import { ResumeReviewStage } from "./stages/ResumeReviewStage";
import { AssessmentStage } from "./stages/AssessmentStage";
import { DocumentVerificationStage } from "./stages/DocumentVerificationStage";
import { InterviewStage } from "./stages/InterviewStage";
import { OfferStage } from "./stages/OfferStage";

/* --------------------------- Stage component registry --------------------------- */
/* Keyed by the raw API stage name. Add one entry here per new stage type —
   this is the ONLY file that needs to change when a new stage type ships. */

export interface StageComponentProps {
  stage: AppliedJobData["stages"][number];
  application: AppliedJobData;
}

const STAGE_REGISTRY: Record<
  string,
  React.ComponentType<StageComponentProps>
> = {
  resume_review: ResumeReviewStage,
  assessment: AssessmentStage,
  document_verification: DocumentVerificationStage,
  hr_interview: InterviewStage,
  technical_interview: InterviewStage,
  final_hr_interview: InterviewStage,
  offer: OfferStage,
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
