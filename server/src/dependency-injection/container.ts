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
import { CompanyRepository } from "../repositories/company/implementation/companyRepository";
import { CompanyService } from "../services/v1/company/implementation/companyService";
import { CompanyController } from "../controllers/v1/company/implementation/companyController";
import { CloudinaryService } from "../services/cloudinary/implementation/cloudinaryService";

const container = new Container();

// repositories
container.bind(TYPES.UserRepository).to(UserRepository);
container.bind(TYPES.CompanyRepository).to(CompanyRepository);
//services
container.bind(TYPES.AuthService).to(AuthService);
container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.CompanyService).to(CompanyService);
container.bind(TYPES.EmailService).to(EmailService);
container.bind(TYPES.RedisService).to(RedisService);
container.bind(TYPES.CloudinaryService).to(CloudinaryService);
container.bind(TYPES.Logger).toConstantValue(logger);
//controller
container.bind(TYPES.AuthController).to(AuthController);
container.bind(TYPES.UserController).to(UserController);
container.bind(TYPES.CompanyController).to(CompanyController);

export { container };
