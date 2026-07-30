import { prisma } from '../../lib/prisma';
import { ICreateCategoryRequest, IUpdateUserStatusRequest } from './admin.interface';

const createCategoryIntoDB = async (payload: ICreateCategoryRequest) => {
  const { name, description } = payload;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/\s+/g, '-');

  const isCategoryExist = await prisma.category.findUnique({
    where: { name },
  });

  if (isCategoryExist) {
    throw new Error('Category already exists with this name!');
  }

  const result = await prisma.category.create({
    data: {
      name,
      slug,
      description,
    },
  });

  return result;
};

const getAllCategoriesFromDB = async (query: Record<string, any> = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = (query.searchTerm || query.search || '') as string;

  const whereConditions: any = {};

  if (search) {
    whereConditions.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const result = await prisma.category.findMany({
    where: whereConditions,
    orderBy: {
      createdAt: 'desc',
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
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};


const getAllUsersFromDB = async (query: Record<string, any> = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = (query.searchTerm || query.search || '') as string;
  const role = query.role as string;

  const whereConditions: any = {};

  if (search) {
    whereConditions.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    whereConditions.role = role.toUpperCase();
  }

  const result = await prisma.user.findMany({
    where: whereConditions,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
      technicianProfile: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const updateUserStatusInDB = async (id: string, payload: IUpdateUserStatusRequest) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id },
  });

  if (!isUserExist) {
    throw new Error('User not found!');
  }

  const result = await prisma.user.update({
    where: { id },
    data: {
      isBanned: payload.isBanned,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
    },
  });

  return result;
};

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  getAllUsersFromDB,
  updateUserStatusInDB,
};