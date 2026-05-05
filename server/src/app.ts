import express from "express";
import authRoutes from "./routes/v1/authRoutes";
import adminRoutes from "./routes/v1/adminRoutes";
import companyRoutes from "./routes/v1/companyRoutes";
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

app.use(errorMiddleware);

export default app;
