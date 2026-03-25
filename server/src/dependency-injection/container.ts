import { Container } from "inversify";
import { TYPES } from "./types.js";

import { AuthController } from "../controllers/auth.controller.js";
import { UserRepository } from "../repositories/implementations/user.repository.js";
import { AuthService } from "../services/implementations/auth.service.js";
import { EmailService } from "../services/implementations/email.service.js";

const container = new Container();

// repositories
container.bind(TYPES.UserRepository).to(UserRepository);
//services
container.bind(TYPES.AuthService).to(AuthService);
container.bind(TYPES.EmailService).to(EmailService);
//controller
container.bind(TYPES.AuthController).to(AuthController);

export { container };
