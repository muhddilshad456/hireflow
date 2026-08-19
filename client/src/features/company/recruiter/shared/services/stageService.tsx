import { STAGE_ACTIONS } from "../../../../../constents/actions/stageActions";
import { APPLICATION_BASE_ROUTE } from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";
import type { MoveToNextStageResult } from "../../../../../types/job/job/jobStage";

export const moveToNextStageBulk = (
  applicationIds: string[],
  feedback?: string,
): Promise<MoveToNextStageResult> => {
  return api
    .patch(
      `/${APPLICATION_BASE_ROUTE}/${STAGE_ACTIONS.MOVE_TO_NEXT_STGE_BULK}`,
      {
        applicationIds,
        ...(feedback ? { feedback } : {}),
      },
    )
    .then((res) => res.data.data);
};
