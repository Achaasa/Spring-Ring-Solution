import { Router } from "express";
import {
  createServiceHandler,
  getServicesHandler,
  getServiceByIdHandler,
  updateServiceHandler,
  deleteServiceHandler,
  deleteServiceImagesHandler,
} from "../controller/serviceController";
import { authenticateJWT, authorizeRole } from "../utils/jsonwebtoken";
import { validatePayload } from "../middleware/validate-payload";
import upload from "../utils/multer";

const serviceRouter = Router();

// Create a new service
serviceRouter.post(
  "/add",
  validatePayload("Service"),
  authenticateJWT,
  authorizeRole(["SUPER_ADMIN", "ADMIN"]),
  upload.fields([{ name: "photos", maxCount: 5 }]),
  createServiceHandler,
);

// Get all services
serviceRouter.get("/get", getServicesHandler);

// Get service by ID
serviceRouter.get("/get/:id", getServiceByIdHandler);

// Update service
serviceRouter.put(
  "/update/:id",
  authenticateJWT,
  validatePayload("Service"),
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  upload.fields([{ name: "photos", maxCount: 5 }]),
  updateServiceHandler,
);

// Delete service
serviceRouter.put(
  "/delete/:id",
  authenticateJWT,
  authorizeRole(["ADMIN", "SUPER_ADMIN"]),
  deleteServiceHandler,
);
serviceRouter.delete("/:serviceId/images", deleteServiceImagesHandler);
export default serviceRouter;
