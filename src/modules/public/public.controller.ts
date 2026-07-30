import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PublicServices } from "./public.service";
import { Request, Response } from "express";

const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await PublicServices.getAllTechniciansFromDB(filters);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Technicians fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleTechnician = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PublicServices.getSingleTechnicianFromDB(id as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Technician profile fetched successfully!",
    data: result,
  });
});

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await PublicServices.getAllServicesFromDB(filters);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Services fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await PublicServices.getAllCategoriesFromDB(filters);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Categories fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

export const PublicControllers = {
  getAllTechnicians,
  getSingleTechnician,
  getAllServices,
  getAllCategories,
};
