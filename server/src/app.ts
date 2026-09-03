import express from "express";
import authRoutes from "./routes/v1/authRoutes";
import adminRoutes from "./routes/v1/adminRoutes";
import companyRoutes from "./routes/v1/companyRoutes";
import recruiterRoutes from "./routes/v1/recruiterRoutes";
import jobRoutes from "./routes/v1/jobRoutes";
import profileRoutes from "./routes/v1/profileRoutes";
import uploadRoutes from "./routes/v1/uploadRoutes";
import applicationRoutes from "./routes/v1/jobApplicationRoutes";
import chatRoutes from "./routes/v1/chatRoutes";
import { errorMiddleware } from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import "reflect-metadata";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/recruiter", recruiterRoutes);
app.use("/api/v1/job", jobRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/application", applicationRoutes);
app.use("/api/v1/chat", chatRoutes);

app.use(errorMiddleware);

export default app;
