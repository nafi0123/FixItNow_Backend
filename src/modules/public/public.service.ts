import { prisma } from "../../lib/prisma";
import { IServiceFilterRequest, ITechnicianFilterRequest } from "./public.interface";

type TechnicianWhereInput = NonNullable<Parameters<typeof prisma.technicianProfile.findMany>[0]>["where"];
type ServiceWhereInput = NonNullable<Parameters<typeof prisma.service.findMany>[0]>["where"];

const getAllTechniciansFromDB = async (filters: ITechnicianFilterRequest) => {
  const { searchTerm, location, rating, skills } = filters;
  
  const whereConditions: TechnicianWhereInput = {};

  if (searchTerm) {
    whereConditions.OR = [
      { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
      { bio: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  if (location) {
    whereConditions.location = { contains: location, mode: 'insensitive' };
  }

  if (rating) {
    whereConditions.rating = { gte: parseFloat(rating) };
  }

  if (skills) {
    whereConditions.skills = { has: skills };
  }

  const result = await prisma.technicianProfile.findMany({
    where: whereConditions,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { rating: 'desc' }, 
  });

  return result;
};

const getSingleTechnicianFromDB = async (id: string) => {
  const result = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!result) {
    throw new Error('Technician not found!');
  }

  return result;
};

const getAllServicesFromDB = async (filters: IServiceFilterRequest) => {
  const { searchTerm, categoryId } = filters;
  
  const whereConditions: ServiceWhereInput = {};

  if (searchTerm) {
    whereConditions.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    whereConditions.categoryId = categoryId;
  }

  const result = await prisma.service.findMany({
    where: whereConditions,
    include: {
      category: true,
      technicianProfile: { 
        include: {
          user: { 
            select: { name: true } 
          },
        },
      },
    },
  });

  return result;
};
const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany({
    orderBy: {
      name: 'asc', 
    },
  });
  return result;
};
export const PublicServices = {
    getAllTechniciansFromDB,
    getSingleTechnicianFromDB,
    getAllServicesFromDB,
    getAllCategoriesFromDB,
};