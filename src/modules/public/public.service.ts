import { prisma } from "../../lib/prisma";
import { IServiceFilterRequest, ITechnicianFilterRequest, ICategoryFilterRequest } from "./public.interface";

type TechnicianWhereInput = NonNullable<Parameters<typeof prisma.technicianProfile.findMany>[0]>["where"];
type ServiceWhereInput = NonNullable<Parameters<typeof prisma.service.findMany>[0]>["where"];
type CategoryWhereInput = NonNullable<Parameters<typeof prisma.category.findMany>[0]>["where"];

// Helper function to map category UUIDs in skills to category names & calculate computed rating
const formatTechnicianSkills = async (technicians: any[]) => {
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return technicians.map((tech) => {
    const resolvedSkills = (tech.skills || []).map((skill: string) => {
      return categoryMap.get(skill) || skill;
    });

    if (tech.services && Array.isArray(tech.services)) {
      tech.services.forEach((s: any) => {
        if (s.category?.name && !resolvedSkills.includes(s.category.name)) {
          resolvedSkills.push(s.category.name);
        }
      });
    }

    let computedRating = tech.rating;
    if (tech.reviews && tech.reviews.length > 0) {
      const sum = tech.reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0);
      computedRating = parseFloat((sum / tech.reviews.length).toFixed(1));
    }

    return {
      ...tech,
      skills: resolvedSkills,
      rating: computedRating,
      hourlyRate: tech.basePrice,
      experienceYears: tech.experience,
    };
  });
};

const getAllTechniciansFromDB = async (filters: ITechnicianFilterRequest) => {
  const { searchTerm, location, rating, skills } = filters;
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

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

  if (rating && !isNaN(parseFloat(String(rating)))) {
    const parsedRating = parseFloat(String(rating));
    if (parsedRating > 0) {
      whereConditions.rating = { gte: parsedRating };
    }
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
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: { rating: 'desc' },
    skip,
    take: limit,
  });

  const total = await prisma.technicianProfile.count({
    where: whereConditions,
  });

  const formattedData = await formatTechnicianSkills(result);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit) || 1,
    },
    data: formattedData,
  };
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
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

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
    skip,
    take: limit,
  });

  const total = await prisma.service.count({
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

const getAllCategoriesFromDB = async (filters: ICategoryFilterRequest = {}) => {
  const search = filters.searchTerm || filters.search || "";
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const whereConditions: CategoryWhereInput = {};

  if (search) {
    whereConditions.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const result = await prisma.category.findMany({
    where: whereConditions,
    orderBy: {
      name: 'asc', 
    },
    skip,
    take: limit,
  });

  const total = await prisma.category.count({
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

export const PublicServices = {
    getAllTechniciansFromDB,
    getSingleTechnicianFromDB,
    getAllServicesFromDB,
    getAllCategoriesFromDB,
};