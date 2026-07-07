import { prisma } from '../../lib/prisma';
import { ICreateReviewRequest } from './review.interface';

const createReviewInDB = async (customerId: string, payload: ICreateReviewRequest) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
  });

  if (!booking || booking.customerId !== customerId) {
    throw new Error('Unauthorized or invalid booking for review!');
  }

  const bookingStatus = String(booking.status).toUpperCase().trim();
  
  if (bookingStatus !== 'COMPLETED') {
    throw new Error('You cannot review this technician until the service is fully COMPLETED!');
  }

  const isAlreadyReviewed = await prisma.review.findUnique({
    where: { bookingId: payload.bookingId },
  });

  if (isAlreadyReviewed) {
    throw new Error('You have already submitted a review for this booking!');
  }

  const result = await prisma.$transaction(async (tx) => {
    const newReview = await tx.review.create({
      data: {
        customerId,
        technicianProfileId: payload.technicianProfileId,
        bookingId: payload.bookingId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const reviewStats = await tx.review.aggregate({
      where: { technicianProfileId: payload.technicianProfileId },
      _avg: { rating: true },
    });

    const averageRating = reviewStats._avg.rating || payload.rating;

    await tx.technicianProfile.update({
      where: { id: payload.technicianProfileId },
      data: { rating: parseFloat(averageRating.toFixed(1)) },
    });

    return newReview;
  });

  return result;
};



export const ReviewServices = {
  createReviewInDB,
  
};