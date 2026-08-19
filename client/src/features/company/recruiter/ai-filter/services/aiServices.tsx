import { AI_ACTIONS } from "../../../../../constents/actions/aiActions";
import { JOB_ACTIONS } from "../../../../../constents/actions/jobActions";
import { RECRUITER_BASE_ROUTE } from "../../../../../constents/routes/apiRoutes";
import api from "../../../../../services/api";

export const callAiForRanking = (jobId: string) => {
  return api
    .get(
      `/${RECRUITER_BASE_ROUTE}/${JOB_ACTIONS.JOBS}/${jobId}/${AI_ACTIONS.AI_FILTER_CANDIDATES}`,
    )
    .then((res) => res.data);
};
