import express from 'express';
import auth from '../../middlewares/auth';
import { TechnicianControllers } from './technician.controller';

const router = express.Router();

router.put(
  '/profile',
  auth('TECHNICIAN'),
  TechnicianControllers.updateProfile
);

router.put(
  '/availability',
  auth('TECHNICIAN'),
  TechnicianControllers.updateAvailability
);
router.post(
  '/services',
  auth('TECHNICIAN'), 
  TechnicianControllers.createService
);
export const TechnicianRoutes = router;