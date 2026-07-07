import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { PaymentServices } from './payment.service';

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const { id: customerId } = (req as any).user;
  const { bookingId } = req.body;

  const result = await PaymentServices.createPaymentSessionInDB(customerId, bookingId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment session created successfully!',
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  // 🎯 ফিক্স: কুয়েরি এবং বডি অবজেক্ট মার্জ করে পাঠানো হলো যাতে ডেটা মিস না হয়
  const paymentData = { ...req.query, ...req.body };
  const result = await PaymentServices.confirmPaymentInDB(paymentData);
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(result);
});

export const PaymentControllers = {
  createPaymentSession,
  confirmPayment,
};