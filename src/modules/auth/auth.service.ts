import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUserRequest, IRegisterUserRequest } from "./auth.interface";
import config from '../../config/index';
import jwt from "jsonwebtoken";

const registerUserIntoDB = async (payload: IRegisterUserRequest) => {
  const { name, email, password, role } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User already exists with this email!");
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

    if (role === "TECHNICIAN") {
      await tx.technicianProfile.create({
        data: {
          userId: newUser.id,
          skills: [],
          experience: 0,
          basePrice: 0.0,
          location: "",
          availability: [],
        },
      });
    }

    return newUser;
  });

  return result;
};

const loginUser = async (payload: ILoginUserRequest) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User does not exist with this email!");
  }

  if (user.isBanned) {
    throw new Error("Your account has been banned by admin!");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Password incorrect!");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret, {
    expiresIn: config.jwt_access_expires_in,
  });

  const refreshToken = jwt.sign(jwtPayload, config.jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_expires_in,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
const getMeFromDB = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found!");
  }

  if (user.role === "TECHNICIAN") {
    const technicianProfile = await prisma.technicianProfile.findUnique({
      where: { userId: user.id },
    });

    return {
      ...user,
      technicianProfile,
    };
  }

  return user;
};
const updateProfileInDB = async (email: string, payload: { name?: string }) => {
  const user = await prisma.user.update({
    where: { email },
    data: { name: payload.name },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
};

const changePasswordInDB = async (
  email: string,
  payload: { currentPassword: string; newPassword: string }
) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found!");

  const isMatch = await bcrypt.compare(payload.currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect!");

  const hashed = await bcrypt.hash(payload.newPassword, 12);
  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  return { message: "Password changed successfully!" };
};

export const AuthServices = {
  registerUserIntoDB,
  loginUser,
  getMeFromDB,
  updateProfileInDB,
  changePasswordInDB,
};
