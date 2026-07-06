import { Router } from "express";
import { PublicControllers } from "./public.controller";
import express from 'express';

const router = express.Router();

router.get('/technicians', PublicControllers.getAllTechnicians);
router.get('/technicians/:id', PublicControllers.getSingleTechnician);
router.get('/services', PublicControllers.getAllServices);
router.get('/categories', PublicControllers.getAllCategories);
export const PublicRoutes = router;