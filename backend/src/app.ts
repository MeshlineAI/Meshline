import express from "express";
import { healthRouter } from "./routes/health";
import { scanRouter } from "./routes/scan";
import { reportRouter } from "./routes/report";
import { badgeRouter } from "./routes/badge";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/v1/scan", scanRouter);
app.use("/v1/report", reportRouter);
app.use("/v1/badge", badgeRouter);

export { app };
