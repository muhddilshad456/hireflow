import { inject, injectable } from "inversify";
import { TYPES } from "../../../../dependency-injection/types";
import { IUserRepository } from "../../../../repositories/user/interfaces/IUserRepository";
import { IWishlistService } from "../interface/IWishlistService";
import { IWishlistRepository } from "../../../../repositories/wishlist/interface/IWishlistRepository";
import { IJobRepository } from "../../../../repositories/job/interface/IJobRepository";
import { IWishlist } from "../../../../models/wishlist/wishlist.model";
import { Types } from "mongoose";
import { Logger } from "pino";
import { USER_MESSAGES } from "../../../../constants/messages/user";
import { UnauthorizedError } from "../../../../errors/unauthorized.error";
import { BadRequestError } from "../../../../errors/bad-request.error";
import { WISHLIST_MESSAGES } from "../../../../constants/messages/wishlist/wishlist";
import { NotFoundError } from "../../../../errors/not-found.error";
import { InternalServerError } from "../../../../errors/internal-server.error";
import { JOB_MESSAGES } from "../../../../constants/messages/jobs";
import { IJob } from "../../../../models/job/job.model";
import { IJobApplicationRepository } from "../../../../repositories/job-application/interface/IJobApplicationRepository";
import { MyApplicationSummary } from "../../../../interfaces/application/application";
import { IJobWithApplication } from "../../../../constants/application/application";

@injectable()
export class WishlistService implements IWishlistService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.WishlistRepository)
    private _wishlistRepository: IWishlistRepository,
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.JobApplicationRepository)
    private _jobApplicationRepository: IJobApplicationRepository,
    @inject(TYPES.Logger) private _logger: Logger,
  ) {}
  //* add to wishlist
  async addToWishlist(userId: string, jobId: string): Promise<IWishlist> {
    if (!userId) {
      this._logger.warn({
        userId,
        event: USER_MESSAGES.USER_ID_MISSING,
      });
      throw new UnauthorizedError(USER_MESSAGES.USER_ID_MISSING);
    }

    if (!Types.ObjectId.isValid(jobId)) {
      this._logger.warn({
        jobId,
        event: WISHLIST_MESSAGES.INVALID_JOB_ID,
      });
      throw new BadRequestError(WISHLIST_MESSAGES.INVALID_JOB_ID);
    }

    const user = await this._userRepository.findById(userId);

    if (!user) {
      this._logger.warn({
        userId,
        event: USER_MESSAGES.USER_NOT_FOUND,
      });
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    const job = await this._jobRepository.findById(jobId);

    if (!job) {
      this._logger.warn({
        jobId,
        event: WISHLIST_MESSAGES.JOB_NOT_FOUND,
      });
      throw new NotFoundError(WISHLIST_MESSAGES.JOB_NOT_FOUND);
    }

    if (job.status !== "OPEN") {
      this._logger.warn({
        jobId,
        event: JOB_MESSAGES.JOB_IS_CLOSED,
      });

      throw new BadRequestError(JOB_MESSAGES.JOB_IS_CLOSED);
    }

    const wishlist = await this._wishlistRepository.findOneAndUpdate(
      { userId },
      {
        $addToSet: {
          jobs: new Types.ObjectId(jobId),
        },
      },
      undefined,
      { upsert: true },
    );

    if (!wishlist) {
      this._logger.error({
        userId,
        jobId,
        event: WISHLIST_MESSAGES.ADD_FAILED,
      });

      throw new InternalServerError(WISHLIST_MESSAGES.ADD_FAILED);
    }

    return wishlist;
  }
  //* get wishlist
  async getWishlist(userId: string): Promise<IJobWithApplication[]> {
    if (!userId) {
      this._logger.warn({
        userId,
        event: USER_MESSAGES.USER_ID_MISSING,
      });
      throw new UnauthorizedError(USER_MESSAGES.USER_ID_MISSING);
    }

    const user = await this._userRepository.findById(userId);

    if (!user) {
      this._logger.warn({
        userId,
        event: USER_MESSAGES.USER_NOT_FOUND,
      });
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    const wishlist = await this._wishlistRepository.findOne(
      { userId },
      undefined,
      { populate: "jobs" },
    );

    if (!wishlist || wishlist.jobs.length === 0) {
      return [];
    }

    const jobs = wishlist.jobs as unknown as IJob[];

    const applications =
      await this._jobApplicationRepository.findByUserAndJobIds(
        userId,
        jobs.map((job) => job._id.toString()),
      );

    const myApplicationByJobId = new Map<string, MyApplicationSummary>();

    for (const application of applications) {
      const jobId = application.jobId.toString();

      if (!myApplicationByJobId.has(jobId)) {
        myApplicationByJobId.set(jobId, {
          _id: application._id.toString(),
          status: application.status,
          appliedAt: application.appliedAt,
        });
      }
    }

    return jobs.map((job) => ({
      ...job.toObject(),
      application: myApplicationByJobId.get(job._id.toString()) ?? null,
    }));
  }
  //* remove from wishlist
  async removeFromWishlist(userId: string, jobId: string): Promise<IWishlist> {
    if (!userId) {
      this._logger.warn({
        userId,
        event: USER_MESSAGES.USER_ID_MISSING,
      });
      throw new UnauthorizedError(USER_MESSAGES.USER_ID_MISSING);
    }

    if (!Types.ObjectId.isValid(jobId)) {
      this._logger.warn({
        jobId,
        event: WISHLIST_MESSAGES.INVALID_JOB_ID,
      });
      throw new BadRequestError(WISHLIST_MESSAGES.INVALID_JOB_ID);
    }

    const user = await this._userRepository.findById(userId);

    if (!user) {
      this._logger.warn({
        userId,
        event: USER_MESSAGES.USER_NOT_FOUND,
      });
      throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND);
    }

    const wishlist = await this._wishlistRepository.findOne({ userId });

    if (!wishlist) {
      this._logger.warn({
        userId,
        event: WISHLIST_MESSAGES.WISHLIST_NOT_FOUND,
      });
      throw new NotFoundError(WISHLIST_MESSAGES.WISHLIST_NOT_FOUND);
    }

    const isJobSaved = wishlist.jobs.some((id) => id.toString() === jobId);

    if (!isJobSaved) {
      this._logger.warn({
        userId,
        jobId,
        event: WISHLIST_MESSAGES.JOB_NOT_IN_WISHLIST,
      });
      throw new NotFoundError(WISHLIST_MESSAGES.JOB_NOT_IN_WISHLIST);
    }

    const updatedWishlist = await this._wishlistRepository.findOneAndUpdate(
      { userId },
      {
        $pull: {
          jobs: new Types.ObjectId(jobId),
        },
      },
    );

    if (!updatedWishlist) {
      this._logger.error({
        userId,
        jobId,
        event: WISHLIST_MESSAGES.REMOVE_FAILED,
      });

      throw new InternalServerError(WISHLIST_MESSAGES.REMOVE_FAILED);
    }

    return updatedWishlist;
  }
}
