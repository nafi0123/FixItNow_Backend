import { prisma } from "../../lib/prisma";
import { IServiceFilterRequest, ITechnicianFilterRequest } from "./public.interface";

type TechnicianWhereInput = NonNullable<Parameters<typeof prisma.technicianProfile.findMany>[0]>["where"];
type ServiceWhereInput = NonNullable<Parameters<typeof prisma.service.findMany>[0]>["where"];

// Helper function to map category UUIDs in skills to category names
const formatTechnicianSkills = async (technicians: any[]) => {
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return technicians.map((tech) => {
    const resolvedSkills = (tech.skills || []).map((skill: string) => {
      return categoryMap.get(skill) || skill;
    });

    // Also include category names from technician's services if available
    if (tech.services && Array.isArray(tech.services)) {
      tech.services.forEach((s: any) => {
        if (s.category?.name && !resolvedSkills.includes(s.category.name)) {
          resolvedSkills.push(s.category.name);
        }
      });
    }

    return {
      ...tech,
      skills: resolvedSkills,
    };
  });
};

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
      services: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { rating: 'desc' }, 
  });

  return await formatTechnicianSkills(result);
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
      services: {
        include: {
          category: true,
        },
      },
      reviews: {
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc', 
        },
      },
    },
  });

  if (!result) {
    throw new Error('Technician not found!');
  }

  const formatted = await formatTechnicianSkills([result]);
  return formatted[0];
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