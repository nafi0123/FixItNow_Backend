import express from "express";
import auth from "../../middlewares/auth";
import { BookingControllers } from "./booking.controller";

const router = express.Router();

router.post("/", auth("CUSTOMER"), BookingControllers.createBooking);

router.get("/", auth("CUSTOMER"), BookingControllers.getUserBookings);

router.get("/:id", auth("CUSTOMER"), BookingControllers.getBookingDetails);

export const BookingRoutes = router;
