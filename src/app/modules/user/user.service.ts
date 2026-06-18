/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import generateOTP from '../../../util/generateOTP';
import unlinkFile from '../../../shared/unlinkFile';
import AppError from '../../errors/AppError';
import bcrypt from 'bcryptjs';
import config from '../../../config';
import { prisma } from '@/util/db';
import type { TCreateUserArgs, TUpdateUserProfileArgs } from './user.interface';

const createUserFromDb = async (payload: TCreateUserArgs) => {
  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Email already used');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
      role: USER_ROLES.USER,
    },
  });

  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  const otp = generateOTP();

  // send email verification
  const accountEmailTemplate = emailTemplate.createAccount({
    name: result?.name || 'User',
    otp,
    email: payload.email,
  });

  await emailHelper.sendEmail(accountEmailTemplate);

  // Update user with authentication details
  const updatedUser = await prisma.user.update({
    where: { id: result.id },
    data: {
      auth_one_time_code: otp,
      auth_expire_at: new Date(Date.now() + 20 * 60000),
    },
  });

  if (!updatedUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found for update');
  }

  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

// create admin by admin =>
const createAdminFromDb = async (payload: TCreateUserArgs) => {
 
  const existingUser = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Email already used');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
      role: USER_ROLES.ADMIN,
      is_verified: true,
    },
  });

  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create admin');
  }

  const { password: _, ...adminWithoutPassword } = result;
  return adminWithoutPassword;
};


const getAllUsers = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: size,
      orderBy: { created_at: 'desc' },
    }),
    prisma.user.count(),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

const getUserProfileFromDB = async (user: JwtPayload) => {
  const { id } = user;
  const isExistUser = await prisma.user.findUnique({
    where: { id },
    // include: { finance_profile: true },
  });

  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User Invalid");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: TUpdateUserProfileArgs,
) => {
  const { id } = user;

  const isExistUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User Invalid");
  }

  if (!isExistUser.is_verified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account first',
    );
  }

  if (payload.image && isExistUser.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await prisma.user.update({
    where: { id },
    data: payload,
  });

  return updateDoc;
};



const getSingleUser = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    // include: { finance_profile: true },
  });
  return result;
};

const searchUsers = async (query: Record<string, unknown>, userId: string) => {
  const { search, role, status, page, limit } = query;

  const pages = parseInt((page as string) || '1', 10);
  const size = parseInt((limit as string) || '10', 10);
  const skip = (pages - 1) * size;

  const where: any = {
    role: {
      not: 'ADMIN',
    },
  };

  if (search) {
    where.OR = [
      {
        name: {
          contains: search as string,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: search as string,
          mode: 'insensitive',
        },
      },
      {
        phone: {
          contains: search as string,
          mode: 'insensitive',
        },
      },
    ];
   
  }

  if (role) {
    where.role = role as string;
  }

  if (status !== undefined) {
    if (typeof status === 'boolean') {
      where.is_verified = status;
    } else if (typeof status === 'string') {
      where.is_verified = status.toLowerCase() === 'true';
    }
  }

  const [result, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: size,
      orderBy: { created_at: 'desc' },
      // include: { finance_profile: true },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage: Math.ceil(total / size),
      total,
    },
  };
};

// all admin by admin =>

const getAllAdmin = async () => {
  const result = await prisma.user.findMany({
    where: {
      role: USER_ROLES.ADMIN,
    },
    orderBy: { created_at: 'desc' },
    // include: { finance_profile: true },
  });

  return result;
};

// user delete by admin =>

const deleteUserByAdmin = async (id: string) => {
  const result = await prisma.user.delete({
    where: { id },
  });
  return result;
};

// add document by Admin =>

const addDocumentByAdmin = async (
  userId: string,
  payload: { document?: string[] }
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { document: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User Invalid");
  }

  const mergedDocs = Array.from(
    new Set([...(user.document ?? []), ...(payload.document ?? [])])
  );

  return prisma.user.update({
    where: { id: userId },
    data: {
      document: mergedDocs,
    },
  });
};

// delete specific document by Admin, document has index so it can be index wise =>

const deleteDocumentByAdmin = async (
  userId: string,
  documentIndex: number
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { document: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User Invalid");
  }

  const updatedDocs = (user.document ?? []).filter((_, index) => index !== documentIndex);

  return prisma.user.update({
    where: { id: userId },
    data: {
      document: updatedDocs,
    },
  });
};


// user delete status by admin =>

const deleteStatusToggle = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: { is_deleted: true } });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'user not found');

  const result = await prisma.user.update({
    where: { id },
    data: { is_deleted: !user.is_deleted },
  });
  return result;
};


// TODO: update finance profile by admin only =>
// update finance profile by admin only =>
const updateFinanceProfileByAdmin = async (
  userId: string,
  financeProfileData: Record<string, unknown> 
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    // include: { finance_profile: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User Invalid");
  }


  const { creditScore, ...financeProfileUpdateData } = financeProfileData;

  const updatedFinanceProfile = await prisma.$transaction(async (tx) => {
    if (creditScore) {
      await tx.user.update({
        where: { id: userId },
        data: { creditScore: creditScore  },
      });
    }

    // return await tx.financeProfile.update({
    //   where: { id: user.finance_profile!.id },
    //   data: financeProfileUpdateData,
    // });
  });

  return updatedFinanceProfile;


  // const updatedFinanceProfile = await prisma.financeProfile.update({
  //   where: { id: user.finance_profile?.id },
  //   data: financeProfileData,
  // });


  // return updatedFinanceProfile;
};



//! financial profile create, update, and get all 

const createFinanceProfile = async (userId: string, financeProfileData:any ) => {

  financeProfileData.userId = userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User Invalid");
  }

  const financeProfile = await prisma.financeProfile.create({
    data: financeProfileData,
  });

  return financeProfile;
};





export const UserService = {
  createUserFromDb,
  getUserProfileFromDB,
  updateProfileToDB,
  getSingleUser,
  searchUsers,
  getAllUsers,
  getAllAdmin,
  deleteUserByAdmin,
  createAdminFromDb,
  addDocumentByAdmin,
  deleteDocumentByAdmin,
  deleteStatusToggle,
  updateFinanceProfileByAdmin,
  createFinanceProfile,
};
