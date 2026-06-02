import { Container } from "inversify";
import { TYPES } from "./types";

import { AuthController } from "../controllers/v1/auth/implementation/authController";
import { UserRepository } from "../repositories/user/implementations/user.repository";
import { AuthService } from "../services/v1/auth/implementation/authService";
import { EmailService } from "../services/email/implementation/email.service";
import { RedisService } from "../services/redis/implementation/redis.service";
import { logger } from "../utils/logger.util";
import { UserController } from "../controllers/v1/users/implementation/userController";
import { UserService } from "../services/v1/user/implementation/userService";
import { CompanyVerRepository } from "../repositories/company/implementation/companyVerRepository";
import { CompanyService } from "../services/v1/company/admin/implementation/companyService";
import { CompanyController } from "../controllers/v1/company/admin/implementation/companyController";
import { CloudinaryService } from "../services/cloudinary/implementation/cloudinaryService";
import { AdminService } from "../services/v1/admin/implementation/adminService";
import { AdminController } from "../controllers/v1/admin/implementation/adminController";
import { CompanyRepository } from "../repositories/company/implementation/companyRepository";
import { InvitationRepository } from "../repositories/company/implementation/invitationRepository";
import { RecruiterService } from "../services/v1/company/recruiter/implementation/recruiterService";
import { RecruiterController } from "../controllers/v1/company/recruiter/implementation/recruiterController";
import { JobRepository } from "../repositories/job/implementation/jobRepository";
import { JobService } from "../services/v1/job/implementation/jobService";
import { JobController } from "../controllers/v1/job/implementation/jobController";

const container = new Container();

// repositories
container.bind(TYPES.UserRepository).to(UserRepository);
container.bind(TYPES.CompanyVerRepository).to(CompanyVerRepository);
container.bind(TYPES.CompanyRepository).to(CompanyRepository);
container.bind(TYPES.InvitationRepository).to(InvitationRepository);
container.bind(TYPES.JobRepository).to(JobRepository);
//services
container.bind(TYPES.AuthService).to(AuthService);
container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.CompanyService).to(CompanyService);
container.bind(TYPES.AdminService).to(AdminService);
container.bind(TYPES.RecruiterService).to(RecruiterService);
container.bind(TYPES.JobService).to(JobService);
container.bind(TYPES.EmailService).to(EmailService);
container.bind(TYPES.RedisService).to(RedisService);
container.bind(TYPES.CloudinaryService).to(CloudinaryService);
container.bind(TYPES.Logger).toConstantValue(logger);
//controller
container.bind(TYPES.AuthController).to(AuthController);
container.bind(TYPES.UserController).to(UserController);
container.bind(TYPES.CompanyController).to(CompanyController);
container.bind(TYPES.AdminController).to(AdminController);
container.bind(TYPES.RecruiterController).to(RecruiterController);
container.bind(TYPES.JobController).to(JobController);

export { container };
