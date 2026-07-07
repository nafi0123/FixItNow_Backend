import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { AuthRoutes } from "./modules/auth/auth.route";
import { CategoryRoutes } from "./modules/admin/admin.route";
import { TechnicianRoutes } from "./modules/technician/technician.route";
import { PublicRoutes } from "./modules/public/public.route";
import { BookingRoutes } from "./modules/booking/booking.route";
import { PaymentRoutes } from "./modules/payment/payment.route";
import { ReviewRoutes } from "./modules/review/review.route";
const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use("/api/subscription/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/api/auth", AuthRoutes);
app.use("/api", CategoryRoutes);
app.use("/api/technician", TechnicianRoutes);
app.use("/api", PublicRoutes);
app.use("/api/bookings", BookingRoutes);
app.use("/api/payments", PaymentRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use(globalErrorHandler);

export default app;
