import express from 'express';
import auth from '../../middlewares/auth';
import { PaymentControllers } from './payment.controller';

const router = express.Router();

router.post('/create', auth('CUSTOMER'), PaymentControllers.createPaymentSession);

router.post('/confirm', PaymentControllers.confirmPayment);
router.get('/confirm', PaymentControllers.confirmPayment);

router.get('/', auth('CUSTOMER', 'ADMIN', 'TECHNICIAN'), PaymentControllers.getAllPayments);
router.get('/:id', auth('CUSTOMER', 'ADMIN', 'TECHNICIAN'), PaymentControllers.getPaymentById);

export const PaymentRoutes = router;