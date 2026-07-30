import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CategoryServices } from "./admin.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.createCategoryIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Category created successfully!",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.getAllCategoriesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Categories fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.getAllUsersFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryServices.updateUserStatusInDB(
    id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `User ${result.isBanned ? "banned" : "unbanned"} successfully!`,
    data: result,
  });
});

export const CategoryControllers = {
  createCategory,
  getAllCategories,
  getAllUsers,
  updateUserStatus,
};
