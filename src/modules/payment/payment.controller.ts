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
  const paymentData = { ...req.query, ...req.body };
  const result = await PaymentServices.confirmPaymentInDB(paymentData);
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(result);
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = (req as any).user;

  const result = await PaymentServices.getAllPaymentsFromDB(userId, role);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment history fetched successfully!',
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const { id: transactionId } = req.params;
  const { id: userId, role } = (req as any).user;

  const result = await PaymentServices.getPaymentByIdFromDB(transactionId as string, userId, role);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment details fetched successfully!',
    data: result,
  });
});

export const PaymentControllers = {
  createPaymentSession,
  confirmPayment,
  getAllPayments,
  getPaymentById,
};