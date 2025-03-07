import express from "express";
import { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

import routers from "./Routers/user.routes";

app.use("/api/v1/users", routers);

export default app;
