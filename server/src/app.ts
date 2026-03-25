import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import "reflect-metadata";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

export default app;
