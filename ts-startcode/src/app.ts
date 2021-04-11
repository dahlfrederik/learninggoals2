import express from "express";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import friendsRoute from "./routes/friendRoutesAuth";
import { ApiError } from "./errors/apiError";
import { Request, Response } from "express";
var cors = require("cors");
import logger, { stream } from "./middleware/logger";

// Til debug
const debug = require("debug")("app");

const app = express();

app.use(cors());

const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev";
app.use(require("morgan")(morganFormat, { stream }));
app.set("logger", logger);

app.use(express.static(path.join(process.cwd(), "public")));

app.use("/api/friends", friendsRoute);

app.get("/demo", (req, res) => {
  res.send("hi");
});

//404 handler for api-requests
app.use("/api", (req, res, next) => {
  res.status(404).json({ errorCode: 404, msg: "not found" });
});

//JSON Error for API-error
app.use((err: any, req: Request, res: Response, next: Function) => {
  if (err instanceof ApiError) {
    const e: ApiError = err;
    if (e.errorCode !== undefined) {
      res.status(e.errorCode).json({ errorCode: 404, msg: "not found" });
    }
  } else {
    next(err);
  }
});

export default app;
