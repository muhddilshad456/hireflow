import { ISubscription } from "../../../models/company/subscription.model";
import { IBaseRepository } from "../../base/interface/IBaseRepository";

export interface ISubscriptionRepository extends IBaseRepository<ISubscription> {
  upsertByCompanyId(
    companyId: string,
    data: Partial<ISubscription>,
  ): Promise<ISubscription | null>;
}
