import express from 'express';
import auth from '../../middlewares/auth';
import { CategoryControllers } from './admin.controller';

const router = express.Router();

router.post(
  '/admin/categories', 
  auth('ADMIN'),
  CategoryControllers.createCategory
);

router.get(
  '/admin/categories', 
  auth('ADMIN'), 
  CategoryControllers.getAllCategories
);

router.get(
  '/admin/users', 
  auth('ADMIN'), 
  CategoryControllers.getAllUsers
);

router.patch(
  '/admin/users/:id', 
  auth('ADMIN'),
  CategoryControllers.updateUserStatus
);

export const CategoryRoutes = router;