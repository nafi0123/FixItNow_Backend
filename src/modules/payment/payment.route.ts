import express from 'express';
import auth from '../../middlewares/auth';
import { PaymentControllers } from './payment.controller';

const router = express.Router();

router.post('/create', auth('CUSTOMER'), PaymentControllers.createPaymentSession);

router.post('/confirm', PaymentControllers.confirmPayment);

export const PaymentRoutes = router;