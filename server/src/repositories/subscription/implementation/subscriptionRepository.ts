import { injectable } from "inversify";
import {
  ISubscription,
  SubscriptionModel,
} from "../../../models/company/subscription.model";
import { ISubscriptionRepository } from "../interface/ISubscriptionRepository";
import { BaseRepository } from "../../base/implementation/base.repository";

@injectable()
export class SubscriptionRepository
  extends BaseRepository<ISubscription>
  implements ISubscriptionRepository
{
  constructor() {
    super(SubscriptionModel);
  }
  async upsertByCompanyId(
    companyId: string,
    data: Partial<ISubscription>,
  ): Promise<ISubscription | null> {
    return SubscriptionModel.findOneAndUpdate(
      { companyId },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}
