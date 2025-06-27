import {
  signUpUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
  userLogIn,
  getUserProfile,
  logout,
  resetUserPassword,
} from "../controller/userController";
import upload from "../utils/multer";
import { validatePayload } from "../middleware/validate-payload";
import { authenticateJWT, authorizeRole } from "../utils/jsonwebtoken";
import { Router } from "express";

const userRouter = Router();

// User sign up
userRouter.post(
  "/signup",
  upload.single("photo"),
  validatePayload("User"), // Assuming you have validation logic for user payload

  signUpUser,
);

// Get all users
userRouter.get("/get", authenticateJWT, authorizeRole(["ADMIN"]), getAllUsers); // Only accessible by SuperAdmin

// Get user by email
userRouter.get(
  "/email",
  authenticateJWT,
  authorizeRole(["USER", "ADMIN"]),
  getUserByEmail,
);

// Get user by ID
userRouter.get(
  "/get/:userId",
  authenticateJWT,
  authorizeRole(["USER", "ADMIN"]),

  getUserById,
);

// Update user
userRouter.put(
  "/update/:userId",
  authenticateJWT,
  validatePayload("User"),
  upload.single("photo"),

  updateUser,
);

// Delete user
userRouter.delete(
  "/delete/:userId",
  authenticateJWT,
  authorizeRole(["USER", "ADMIN"]),

  deleteUser,
);

// User login
userRouter.post("/login", validatePayload("User"), userLogIn);

// Get user profile
userRouter.get("/profile", authenticateJWT, getUserProfile);

// User logout
userRouter.post("/logout", authenticateJWT, logout);
userRouter.post("/reset-password", resetUserPassword);

export default userRouter;
