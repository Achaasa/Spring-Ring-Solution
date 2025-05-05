import { Router } from "express";
import userRouter from "./userRoutes";
import notificationRouter from "./notificationRoutes";
import serviceRouter from "./serviceRoutes";
import paymentRouter from "./paymentRoutes";
import feedbackRouter from "./feedbackRoutes";
import bookingRouter from "./bookingRoutes";
import analyticsRouter from "./analyticsRoutes";
const mainRouter = Router();
mainRouter.use("/users", userRouter);
mainRouter.use("/notifications", notificationRouter);
mainRouter.use("/services", serviceRouter);
mainRouter.use("/payments", paymentRouter);
mainRouter.use("/feedbacks", feedbackRouter);
mainRouter.use("/bookings", bookingRouter);
mainRouter.use("/analytics", analyticsRouter);

export default mainRouter;
