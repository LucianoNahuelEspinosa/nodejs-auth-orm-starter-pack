import { createServer } from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from './config';

import { orm } from './database';
import databaseContext from "./middlewares/databaseContext";

import logger from './middlewares/logger';
import rateLimiter from "./middlewares/rateLimiter";
import errorHandler from "./middlewares/errorHandler";
import routes from './routes';

const app = express();
const port = process.env.PORT || 4000;

const apiLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 Minute
    max: 80,
    message: 'Take it easy, wait a minute.'
});

app.use(express.json({ limit: "300mb" }));
app.use(express.urlencoded({ limit: "300mb", extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(logger);
app.use(apiLimiter);
app.use(databaseContext);

const server = createServer(app);
app.use("/api", routes);
app.use(errorHandler);

server.listen(port, () => {
    console.info(`Server running on port ${port}`);
});

const shutdown = async () => {
  await orm.close(true);
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);