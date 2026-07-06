import Prisma from "@prisma/client";
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

  // গ) সব ঠিক থাকলে ডাটা আপডেট
  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: payload,
  });

  return result;
};

const updateAvailabilityInDB = async (
  userId: string,
  payload: IUpdateTechnicianAvailability,
) => {
  const isProfileExist = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!isProfileExist) {
    throw new Error("Technician profile not found!");
  }

  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: {
      availability: payload.availability as Prisma.InputJsonValue,
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

export const TechnicianServices = {
  updateProfileInDB,
  updateAvailabilityInDB,
  createServiceInDB,
};
