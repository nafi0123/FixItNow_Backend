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
export const AuthRoutes = router;