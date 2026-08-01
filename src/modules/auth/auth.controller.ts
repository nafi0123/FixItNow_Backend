import { Request, Response } from 'express';
import { AuthServices } from './auth.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse'; 

const registerNewUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUserIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User registered successfully!',
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);
  const { accessToken, refreshToken, user } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000 
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User logged in successfully!',
    data: {
      accessToken,
      user,
    },
  });
});
const getMe = catchAsync(async (req: Request, res: Response) => {
  const { email } = (req as any).user; 
  const result = await AuthServices.getMeFromDB(email);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User profile fetched successfully!',
    data: result,
  });
});
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { email } = (req as any).user;
  const result = await AuthServices.updateProfileInDB(email, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Profile updated successfully!',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = (req as any).user;
  const result = await AuthServices.changePasswordInDB(email, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Password changed successfully!',
    data: result,
  });
});

export const AuthControllers = {
  registerNewUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
};