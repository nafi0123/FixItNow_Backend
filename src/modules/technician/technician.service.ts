import { Prisma } from "../../generated/prisma";
import { prisma } from "../../lib/prisma";
import {
  ICreateServiceRequest,
  IUpdateTechnicianAvailability,
  IUpdateTechnicianProfile,
} from "./technician.interface";
const updateProfileInDB = async (
  userId: string,
  payload: IUpdateTechnicianProfile,
) => {
  const isProfileExist = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!isProfileExist) {
    throw new Error("Technician profile not found!");
  }

  if (payload.skills && payload.skills.length > 0) {
    const existingCategories = await prisma.category.findMany({
      where: {
        id: {
          in: payload.skills,
        },
      },
      select: { id: true },
    });

    if (existingCategories.length !== payload.skills.length) {
      throw new Error(
        "One or more selected skills (Category IDs) are invalid!",
      );
    }
  }

  const updateData: any = {};

  if (payload.bio !== undefined) updateData.bio = payload.bio;
  if (payload.location !== undefined) updateData.location = payload.location;
  if (payload.skills !== undefined) updateData.skills = payload.skills;
  if (payload.experience !== undefined) updateData.experience = payload.experience;
  if (payload.experienceYears !== undefined) updateData.experience = payload.experienceYears;

  if (payload.basePrice !== undefined) {
    updateData.basePrice = payload.basePrice;
  } else if (payload.hourlyRate !== undefined) {
    updateData.basePrice = payload.hourlyRate;
  }

  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: updateData,
  });

  return result;
};

const updateAvailabilityInDB = async (
  userId: string,
  payload: any,
) => {
  const isProfileExist = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!isProfileExist) {
    throw new Error("Technician profile not found!");
  }

  let availabilityData: any;
  if (payload && payload.availability !== undefined) {
    availabilityData = payload.availability;
  } else {
    availabilityData = payload;
  }

  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: {
      availability: availabilityData as Prisma.InputJsonValue,
    },
  });

  return result;
};

const createServiceInDB = async (userId: string, payload: ICreateServiceRequest) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new Error('Technician profile not found!');
  }

  const isCategoryExist = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!isCategoryExist) {
    throw new Error('Invalid Category ID! Category does not exist.');
  }

  const result = await prisma.service.create({
    data: {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      duration: payload.duration,

      category: {
        connect: { id: payload.categoryId }
      },

      technicianProfile: {
        connect: { id: technicianProfile.id }
      }
    },
  });

  return result;
};


const getTechnicianBookingsFromDB = async (userId: string, query: Record<string, any> = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = (query.searchTerm || query.search || '') as string;

  const whereConditions: any = {
    technicianProfile: {
      userId: userId,
    },
  };

  if (search) {
    whereConditions.AND = [
      {
        OR: [
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { email: { contains: search, mode: 'insensitive' } } },
        ],
      },
    ];
  }

  const result = await prisma.booking.findMany({
    where: whereConditions,
    include: {
      customer: { select: { name: true, email: true } },
      technicianProfile: {
        select: {
          basePrice: true,
          location: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  const total = await prisma.booking.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit) || 1,
    },
    data: result,
  };
};

const updateBookingStatusInDB = async (
  bookingId: string,
  userId: string,
  payload: { status: 'ACCEPTED' | 'DECLINED' | 'COMPLETED' }
) => {
  const { status } = payload;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      technicianProfile: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found!');
  }

  if (booking.technicianProfile.userId !== userId) {
    throw new Error('Unauthorized! This booking does not belong to you.');
  }

  let updateData = { status };

  if (status === 'ACCEPTED') {
    console.log("Booking accepted! Ready to generate SSLCommerz Payment URL...");
  }

  if (status === 'COMPLETED') {
    if (booking.status !== 'ACCEPTED') {
      throw new Error('Only accepted bookings can be marked as completed!');
    }
  }

  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
  });

  return result;
};

const updateServiceInDB = async (serviceId: string, userId: string, payload: Partial<ICreateServiceRequest>) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { technicianProfile: true },
  });

  if (!service) {
    throw new Error('Service not found!');
  }

  if (service.technicianProfile.userId !== userId) {
    throw new Error('Unauthorized! You can only update your own service.');
  }

  if (payload.categoryId) {
    const isCategoryExist = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });
    if (!isCategoryExist) {
      throw new Error('Invalid Category ID!');
    }
  }

  const result = await prisma.service.update({
    where: { id: serviceId },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.description && { description: payload.description }),
      ...(payload.price && { price: payload.price }),
      ...(payload.duration && { duration: payload.duration }),
      ...(payload.categoryId && { categoryId: payload.categoryId }),
    },
    include: {
      category: true,
    },
  });

  return result;
};

const deleteServiceFromDB = async (serviceId: string, userId: string) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { technicianProfile: true },
  });

  if (!service) {
    throw new Error('Service not found!');
  }

  if (service.technicianProfile.userId !== userId) {
    throw new Error('Unauthorized! You can only delete your own service.');
  }

  const result = await prisma.service.delete({
    where: { id: serviceId },
  });

  return result;
};

export const TechnicianServices = {
  updateProfileInDB,
  updateAvailabilityInDB,
  createServiceInDB,
  updateServiceInDB,
  deleteServiceFromDB,
  getTechnicianBookingsFromDB,
  updateBookingStatusInDB,
};
