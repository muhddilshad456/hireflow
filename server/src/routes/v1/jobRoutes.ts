import { Router } from "express";
import { TYPES } from "../../dependency-injection/types";
import { container } from "../../dependency-injection/container";
import { IJobController } from "../../controllers/v1/job/interface/IJobController";

const router = Router();

const jobController = container.get<IJobController>(TYPES.JobController);

router.get("/jobs", jobController.getJobs.bind(jobController));

router.get("/job/:id", jobController.getJob.bind(jobController));

router.patch("/status/:id", jobController.updateStatus.bind(jobController));

export default router;
