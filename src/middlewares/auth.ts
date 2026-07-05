import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config'; 
import { prisma } from '../lib/prisma';
import { catchAsync } from '../utils/catchAsync';

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      throw new Error('You are not authorized! Token is missing.');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt_access_secret) as JwtPayload;
    } catch (err) {
      throw new Error('Unauthorized! Invalid or expired token.');
    }

    const { email, role } = decoded;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('This user is not found!');
    }

    if (user.isBanned) {
      throw new Error('This user is banned!');
    }

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new Error('You have no permission to access this route!');
    }

    (req as any).user = decoded;
    next();
  });
};

export default auth;