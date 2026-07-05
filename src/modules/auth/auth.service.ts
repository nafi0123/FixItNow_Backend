import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma'; 
import { IRegisterUserRequest } from './auth.interface';


const registerUserIntoDB = async (payload: IRegisterUserRequest) => {
  const { name, email, password, role } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error('User already exists with this email!');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (role === 'TECHNICIAN') {
      await tx.technicianProfile.create({
        data: {
          userId: newUser.id,
          skills: [],
          experience: 0,
          basePrice: 0.0,
          location: '',
          availability: [],
        },
      });
    }

    return newUser;
  });

  return result;
};

export const AuthServices = {
  registerUserIntoDB,
};