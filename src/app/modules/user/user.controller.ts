/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import getFilePath from '../../../shared/getFilePath';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const value = {
    ...req.body,
  };

  await UserService.createUserFromDb(value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Please check your email to verify your account.',
  });
});

const getAllUser = catchAsync(async (req, res) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all user retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await UserService.updateProfileToDB(user, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleUser(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User retrieved successfully',
    data: result,
  });
});

// search by 
const searchAllUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req?.user?.id;

  const result = await UserService.searchUsers(
    req.query,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all user by search and filter',
    data: result,
  });
});


const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllAdmin();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all admin retrieved successfully',
    data: result,
  });
});


const deleteUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteUserByAdmin(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User deleted successfully',
    data: result,
  });
});

const createAdminFromDb = catchAsync(async (req: Request, res: Response) => {
  const value = {
    ...req.body,
  };
    const result = await UserService.createAdminFromDb(value);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin created successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  createAdminFromDb,
  getSingleUser,
  getAllUser,
  searchAllUser,
  getAllAdmin,
  deleteUserByAdmin,
};
