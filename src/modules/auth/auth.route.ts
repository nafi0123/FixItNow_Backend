import express from 'express';
import { AuthControllers } from './auth.controller';

const router = express.Router();

// 🎯 রিকোয়ারমেন্ট অনুযায়ী এন্ডপয়েন্ট: POST /api/auth/register
router.post('/register', AuthControllers.registerNewUser);

export const AuthRoutes = router;