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

// ২. লগইন কন্ট্রোলার
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);
  const { accessToken, refreshToken, user } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000 // ৩০ দিন
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

export const AuthControllers = {
  registerNewUser,
  loginUser,
};