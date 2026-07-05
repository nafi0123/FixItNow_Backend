import { Request, Response } from 'express';
import { AuthServices } from './auth.service';
import { catchAsync } from '../../utils/catchAsync';

const registerNewUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUserIntoDB(req.body);

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'User registered successfully!',
    data: result,
  });
});

export const AuthControllers = {
  registerNewUser,
};