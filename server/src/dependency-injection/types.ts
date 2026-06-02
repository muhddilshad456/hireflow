export const TYPES = {
  //controller
  AuthController: Symbol.for("AuthController"),
  UserController: Symbol.for("UserController"),
  CompanyController: Symbol.for("CompanyController"),
  AdminController: Symbol.for("AdminController"),
  RecruiterController: Symbol.for("RecruiterController"),
  JobController: Symbol.for("JobController"),
  //service
  CompanyService: Symbol.for("CompanyService"),
  AuthService: Symbol.for("AuthService"),
  UserService: Symbol.for("UserService"),
  AdminService: Symbol.for("AdminService"),
  RecruiterService: Symbol.for("RecruiterService"),
  JobService: Symbol.for("JobService"),
  //repository
  UserRepository: Symbol.for("UserRepository"),
  CompanyVerRepository: Symbol.for("CompanyVerRepository"),
  CompanyRepository: Symbol.for("CompanyRepository"),
  InvitationRepository: Symbol.for("InvitationRepository"),
  JobRepository: Symbol.for("JobRepository"),
  //other
  EmailService: Symbol.for("EmailService"),
  RedisService: Symbol.for("RedisService"),
  CloudinaryService: Symbol.for("CloudinaryService"),
  Logger: Symbol.for("Logger"),
};
