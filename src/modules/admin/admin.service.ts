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

const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany({
    orderBy: {
      createdAt: 'desc', 
    },
  });
  return result;
};


const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
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
  });
  return result;
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