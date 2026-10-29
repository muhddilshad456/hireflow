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
import { jobStageRepository } from "../repositories/job/implementation/jobStageRepository";
import { ProfileController } from "../controllers/v1/profile/implementation/profileController";
import { ProfileService } from "../services/v1/profile/implementation/profileService";
import { UserProfileRepository } from "../repositories/profile/implementation/userProfileRepository";
import { JobApplicationRepository } from "../repositories/job-application/implementation/jobApplicationRepository";
import { JobApplicationStageRepository } from "../repositories/job-application/implementation/jobApplicationStageRepository";
import { UploadService } from "../services/v1/upload/implementation/uploadService";
import { UploadController } from "../controllers/v1/upload/implementation/uploadController";
import { JobApplicationService } from "../services/v1/job application/implementation/jobApplicationService";
import { JobApplicationController } from "../controllers/v1/job application/implementation/jobApplicationController";
import { MessageRepository } from "../repositories/chat/message/implementation/message.repository";
import { ConversationRepository } from "../repositories/chat/conversation/implementation/conversation.repository";
import { MessageService } from "../services/v1/chat/message/implementation/messageService";
import { ConversationService } from "../services/v1/chat/conversation/implementation/conversationService";
import { MessageController } from "../controllers/v1/chat/message/implementation/messageController";
import { SocketChatEventPublisher } from "../events/chat/implementation/socket-chat-event-publisher";
import { ConversationController } from "../controllers/v1/chat/conversation/implementation/conversationController";
import { ChatPermissionService } from "../services/v1/chat/chat-permission/implementation/chatPermissionService";
import { PasswordController } from "../controllers/v1/auth/implementation/passwordController";
import { EmailController } from "../controllers/v1/auth/implementation/emailController";
import { AuthEmailService } from "../services/v1/auth/implementation/authEmailService";
import { PasswordService } from "../services/v1/auth/implementation/passwordService";
import { InterviewRepository } from "../repositories/interview/implementation/interviewRepository";
import { InterviewRequestRepository } from "../repositories/interview-request/implementation/interviewRequestRepository";
import { InterviewService } from "../services/v1/interview/implementation/interviewService";
import { InterviewController } from "../controllers/v1/interview/implementation/interviewController";
import { InterviewerProfileRepository } from "../repositories/profile/implementation/interviewerProfileRepository";
import { InterviewerService } from "../services/v1/company/interviewer/implementation/interviewerService";
import { InterviewerController } from "../controllers/v1/company/interviewer/implementation/interviewerController";
import { SubscriptionRepository } from "../repositories/subscription/implementation/subscriptionRepository";
import { SubscriptionService } from "../services/v1/subscription/implementation/subscriptionService";
import { SubscriptionwebhookController } from "../controllers/v1/stripe/implementation/subscriptionwebhookController";
import { SubscriptionController } from "../controllers/v1/subscription/implementation/subscriptionController";
import { NotificationRepository } from "../repositories/notification/implementation/notificationRepository";
import { NotificationService } from "../services/v1/notification/implementation/notificationService";
import { NotificationController } from "../controllers/v1/notification/implementation/notificationController";
import { DashboardRepository } from "../repositories/dashboard/implementation/dashboardRepository";

const container = new Container();

// repositories
container.bind(TYPES.UserRepository).to(UserRepository);
container.bind(TYPES.CompanyVerRepository).to(CompanyVerRepository);
container.bind(TYPES.CompanyRepository).to(CompanyRepository);
container.bind(TYPES.InvitationRepository).to(InvitationRepository);
container.bind(TYPES.JobRepository).to(JobRepository);
container.bind(TYPES.JobStageRepository).to(jobStageRepository);
container.bind(TYPES.UserProfileRepository).to(UserProfileRepository);
container.bind(TYPES.JobApplicationRepository).to(JobApplicationRepository);
container
  .bind(TYPES.JobApplicationStageRepository)
  .to(JobApplicationStageRepository);
container.bind(TYPES.MessageRepository).to(MessageRepository);
container.bind(TYPES.ConversationRepository).to(ConversationRepository);
container.bind(TYPES.InterviewRepository).to(InterviewRepository);
container.bind(TYPES.InterviewRequestRepository).to(InterviewRequestRepository);
container
  .bind(TYPES.InterviewerProfileRepository)
  .to(InterviewerProfileRepository);
container.bind(TYPES.SubscriptionRepository).to(SubscriptionRepository);
container.bind(TYPES.NotificationRepository).to(NotificationRepository);
container.bind(TYPES.DashboardRepository).to(DashboardRepository);
//services
container.bind(TYPES.AuthService).to(AuthService);
container.bind(TYPES.AuthEmailService).to(AuthEmailService);
container.bind(TYPES.PasswordService).to(PasswordService);
container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.CompanyService).to(CompanyService);
container.bind(TYPES.AdminService).to(AdminService);
container.bind(TYPES.RecruiterService).to(RecruiterService);
container.bind(TYPES.JobService).to(JobService);
container.bind(TYPES.ProfileService).to(ProfileService);
container.bind(TYPES.UploadService).to(UploadService);
container.bind(TYPES.JobApplicationService).to(JobApplicationService);
container.bind(TYPES.ConversationService).to(ConversationService);
container.bind(TYPES.ChatPermissionService).to(ChatPermissionService);
container.bind(TYPES.InterviewService).to(InterviewService);
container.bind(TYPES.InterviewerService).to(InterviewerService);
container.bind(TYPES.SubscriptionService).to(SubscriptionService);
container.bind(TYPES.NotificationService).to(NotificationService);
///////////////////
container.bind(TYPES.EmailService).to(EmailService);
container.bind(TYPES.RedisService).to(RedisService);
container.bind(TYPES.CloudinaryService).to(CloudinaryService);
container.bind(TYPES.Logger).toConstantValue(logger);
//controller
container.bind(TYPES.AuthController).to(AuthController);
container.bind(TYPES.PasswordController).to(PasswordController);
container.bind(TYPES.EmailController).to(EmailController);
container.bind(TYPES.UserController).to(UserController);
container.bind(TYPES.CompanyController).to(CompanyController);
container.bind(TYPES.AdminController).to(AdminController);
container.bind(TYPES.RecruiterController).to(RecruiterController);
container.bind(TYPES.JobController).to(JobController);
container.bind(TYPES.ProfileController).to(ProfileController);
container.bind(TYPES.UploadController).to(UploadController);
container.bind(TYPES.JobApplicationController).to(JobApplicationController);
container.bind(TYPES.ConversationController).to(ConversationController);
container.bind(TYPES.InterviewController).to(InterviewController);
container.bind(TYPES.InterviewerController).to(InterviewerController);
container.bind(TYPES.SubscriptionController).to(SubscriptionController);
container
  .bind(TYPES.SubscriptionwebhookController)
  .to(SubscriptionwebhookController);
container.bind(TYPES.NotificationController).to(NotificationController);

export function bindSocketDependencies(io: import("socket.io").Server) {
  container.bind(TYPES.SocketIO).toConstantValue(io);
  container.bind(TYPES.ChatEventPublisher).to(SocketChatEventPublisher);
  container.bind(TYPES.MessageService).to(MessageService);
  container.bind(TYPES.MessageController).to(MessageController);
}

export { container };
