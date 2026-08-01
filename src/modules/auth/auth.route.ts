import express from 'express';
import { AuthControllers } from './auth.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/register', AuthControllers.registerNewUser);
router.post('/login', AuthControllers.loginUser);
router.get(
  '/me',
  auth('CUSTOMER', 'TECHNICIAN', 'ADMIN'),
  AuthControllers.getMe
);
router.patch(
  '/update-profile',
  auth('CUSTOMER', 'TECHNICIAN', 'ADMIN'),
  AuthControllers.updateProfile
);
router.patch(
  '/change-password',
  auth('CUSTOMER', 'TECHNICIAN', 'ADMIN'),
  AuthControllers.changePassword
);
export const AuthRoutes = router;