export interface MoveToNextStageResult {
  succeeded: { applicationId: string; nextStage: any }[];
  failed: { applicationId: string; reason: string }[];
}
