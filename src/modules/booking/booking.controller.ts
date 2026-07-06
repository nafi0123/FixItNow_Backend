import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { BookingServices } from './booking.service';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const { id: customerId } = (req as any).user;
  const result = await BookingServices.createBookingInDB(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Appointment booked successfully!',
    data: result,
  });
});

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = (req as any).user;
  const result = await BookingServices.getUserBookingsFromDB(userId, role);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Bookings fetched successfully!',
    data: result,
  });
});

const getBookingDetails = catchAsync(async (req: Request, res: Response) => {
  const { id: bookingId } = req.params;
  const { id: userId, role } = (req as any).user;
  
  const result = await BookingServices.getBookingDetailsFromDB(bookingId as string, userId, role);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Booking details fetched successfully!',
    data: result,
  });
});

export const BookingControllers = {
  createBooking,
  getUserBookings,
  getBookingDetails,
};