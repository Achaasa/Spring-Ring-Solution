import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import mainRouter from "./routes";
import prisma from "./utils/prisma";
import { createAdminUser } from "./controller/adminPanel";
import { ErrorResponse } from "./utils/types";
import HttpException from "./utils/http-error";
import { HttpStatus } from "./utils/http-status";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import redisClient from "./utils/redisClient";
// import * as swaggerDocs from './swagger.json'
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 2020;
app.use((req, res, next) => {
  (req as any).rawBody = "";
  req.on("data", (chunk: Buffer) => {
    (req as any).rawBody += chunk.toString();
  });
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Ensure form-data is parsed properly

app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "http://localhost:2020",
      "https://spring-ring-bloom-ui.vercel.app",
      "https://spring-ring-solution.onrender.com",
      "https://spring-ring-solution.onrender.com/api",
      "https://localhost:8080",
    ],
    credentials: true,
  }),
);
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api", mainRouter);

// Handle 404 errors
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.log("error handler: ", error.status || 500, next);
  res.status(error.status || 500).json({
    status: error.status || 500,
    error: error.message,
  });
});

const startServer = async () => {
  try {
    await createAdminUser(); // Call the function to create the admin user
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
      console.log(
        `Swagger documentation available at http://localhost:${port}/api-docs`,
      );
    });
  } catch (error) {
    const err = error as ErrorResponse;
    throw new HttpException(
      err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      err.message || "Failed to start server",
    );
  } finally {
    await prisma.$disconnect(); // Ensure Prisma client disconnects
  }
};


startServer(); // Start the server
