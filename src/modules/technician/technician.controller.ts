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

export const TechnicianControllers = {
  updateProfile,
  updateAvailability,
};