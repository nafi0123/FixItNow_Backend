import { NextFunction, Request, Response } from 'express';
import config from '../config'; 
import { prisma } from '../lib/prisma';
import { catchAsync } from '../utils/catchAsync';
import { jwtUtils } from '../utils/jwt';

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization;

    if (!token) {
      throw new Error('You are not authorized! Token is missing.');
    }

    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    const verificationResult = jwtUtils.verifyToken(token!, config.jwt_access_secret);

    if (!verificationResult.success) {
      throw new Error('Unauthorized! Invalid or expired token.');
    }

    const decoded = verificationResult.data;
    const { email, role } = decoded as any;

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