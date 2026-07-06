import express from 'express';
import auth from '../../middlewares/auth';
import { BookingControllers } from './booking.controller';

const router = express.Router();

router.post('/', auth('CUSTOMER'), BookingControllers.createBooking);

router.get('/', auth('CUSTOMER', 'TECHNICIAN'), BookingControllers.getUserBookings);

router.get('/:id', auth('CUSTOMER', 'TECHNICIAN'), BookingControllers.getBookingDetails);

export const BookingRoutes = router;