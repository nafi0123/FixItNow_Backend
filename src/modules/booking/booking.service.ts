import { prisma } from '../../lib/prisma';
import { ICreateBookingRequest } from './booking.interface';


const createBookingInDB = async (customerId: string, payload: ICreateBookingRequest) => {
  const isTechnicianExist = await prisma.technicianProfile.findUnique({
    where: { id: payload.technicianProfileId },
  });

  if (!isTechnicianExist) {
    throw new Error('Technician profile not found!');
  }

  const result = await prisma.booking.create({
    data: {
      customerId: customerId,
      technicianProfileId: payload.technicianProfileId,
      bookingDate: new Date(payload.bookingDate),
      slot: payload.slot,
      status: 'PENDING',
    },
    include: {
      technicianProfile: {
        include: {
          user: { select: { name: true, email: true } }
        }
      }
    }
  });

  return result;
};

const getUserBookingsFromDB = async (userId: string, role: string) => {
  const whereConditions: any = {};

  if (role === 'CUSTOMER') {
    whereConditions.customerId = userId;
  } else if (role === 'TECHNICIAN') {
    whereConditions.technicianProfile = { userId: userId };
  }

  const result = await prisma.booking.findMany({
    where: whereConditions,
    include: {
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  return result;
};

const getBookingDetailsFromDB = async (bookingId: string, userId: string, role: string) => {
  const result = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { select: { name: true, email: true } },
      technicianProfile: true, 
    }
  });

  if (!result) {
    throw new Error('Booking details not found!');
  }

  if (role === 'CUSTOMER' && result.customerId !== userId) {
    throw new Error('Unauthorized access to this booking!');
  }

  return result;
};

export const BookingServices = {
  createBookingInDB,
  getUserBookingsFromDB,
  getBookingDetailsFromDB,
};