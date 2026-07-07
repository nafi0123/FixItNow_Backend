import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { ReviewServices } from './review.service';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const { id: customerId } = (req as any).user;
  const result = await ReviewServices.createReviewInDB(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Review and rating submitted successfully!',
    data: result,
  });
});


export const ReviewControllers = {
  createReview,
};