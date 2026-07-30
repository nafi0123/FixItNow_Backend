import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { TechnicianServices } from './technician.service'; 

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = (req as any).user;
  const result = await TechnicianServices.updateProfileInDB(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Technician profile updated successfully!',
    data: result,
  });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = (req as any).user;
  const result = await TechnicianServices.updateAvailabilityInDB(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Technician availability updated successfully!',
    data: result,
  });
});

const createService = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = (req as any).user;
  const result = await TechnicianServices.createServiceInDB(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Service created successfully by technician!',
    data: result,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const { id: serviceId } = req.params;
  const { id: userId } = (req as any).user;
  const result = await TechnicianServices.updateServiceInDB(serviceId as string, userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Service updated successfully!',
    data: result,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const { id: serviceId } = req.params;
  const { id: userId } = (req as any).user;
  const result = await TechnicianServices.deleteServiceFromDB(serviceId as string, userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Service deleted successfully!',
    data: result,
  });
});

const getTechnicianBookings = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = (req as any).user;
  const result = await TechnicianServices.getTechnicianBookingsFromDB(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Technician's bookings fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id: bookingId } = req.params;
  const { id: userId } = (req as any).user;
  
  const result = await TechnicianServices.updateBookingStatusInDB(bookingId as string, userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Booking status updated to ${req.body.status} successfully!`,
    data: result,
  });
});

export const TechnicianControllers = {
  updateProfile,
  updateAvailability,
  createService,
  updateService,
  deleteService,
  getTechnicianBookings,
  updateBookingStatus,
};