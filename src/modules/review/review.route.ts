import express from 'express';
import auth from '../../middlewares/auth';
import { ReviewControllers } from './review.controller';

const router = express.Router();

router.post('/', auth('CUSTOMER'), ReviewControllers.createReview);


export const ReviewRoutes = router;