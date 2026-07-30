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

router.put(
  '/services/:id',
  auth('TECHNICIAN'),
  TechnicianControllers.updateService
);

router.delete(
  '/services/:id',
  auth('TECHNICIAN'),
  TechnicianControllers.deleteService
);

router.get(
  '/bookings', 
  auth('TECHNICIAN'), 
  TechnicianControllers.getTechnicianBookings
);

router.patch(
  '/bookings/:id', 
  auth('TECHNICIAN'), 
  TechnicianControllers.updateBookingStatus
);

export const TechnicianRoutes = router;