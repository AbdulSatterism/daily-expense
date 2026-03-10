/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/util/db";
import { IRemainder } from "./Remainder.interface";
import AppError from "@/app/errors/AppError";
import { StatusCodes } from "http-status-codes";

const createReminder  = async (
  userId: string,
  payload: IRemainder,
) => {
  payload.user_id = userId;

  const isExistUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'user not found!');
  }

  const result = await prisma.reminder.create({
    data: payload,
  });
  return result;
};


// need all reminder , prams will pass (all, upcomming, paid, overdue). but for all show all {upcomming which is  (it's mean 1 or 2 day left) , upcomming (1 or more days left) , paid (paid reminder) , overdue (overdue means past due date) }

const getAllReminders = async (userId: string, filter: string) => {
  const isExistUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'user not found!');
  }

  const currentDate = new Date();

  if (filter === 'all') {
    const upcoming = await prisma.reminder.findMany({
      where: {
      user_id: userId,
      due_date: { gt: currentDate },
      status: 'UNPAID',
      },
      orderBy: { due_date: 'asc' },
      take: 2,
    });

    const complete = await prisma.reminder.findMany({
      where: {
        user_id: userId,
        status: 'PAID',
      },
      orderBy: { due_date: 'asc' },
    });

    const overdue = await prisma.reminder.findMany({
      where: {
        user_id: userId,
        due_date: { lt: currentDate },
        status: 'UNPAID',
      },
      orderBy: { due_date: 'asc' },
    });

    return { upcoming, complete, overdue };
  }

  const whereClause: any = { user_id: userId };

  if (filter === 'upcoming') {
    whereClause.due_date = {
      gt: currentDate,
    };
    whereClause.status = 'UNPAID';
  } else if (filter === 'paid') {
    whereClause.status = 'PAID';
  } else if (filter === 'overdue') {
    whereClause.due_date = { lt: currentDate };
    whereClause.status = 'UNPAID';
  }

  const reminders = await prisma.reminder.findMany({
    where: whereClause,
    orderBy: { due_date: 'asc' },
  });

  return reminders;
};

// get remainder by id and update if unpaid to paid 

const getReminderAndMakePaid = async (userId: string, id: string) => {
  const isExistUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'user not found!');
  }

  const remainder = await prisma.reminder.findFirst({
    where: {
      id,
      user_id: userId,
    },
  });

  if (!remainder) {
    throw new AppError(StatusCodes.NOT_FOUND, 'remainder not found!');
  }

  if (remainder.status === 'UNPAID') {
    const updatedRemainder = await prisma.reminder.update({
      where: { id },
      data: { status: 'PAID' },
    });
    return updatedRemainder;
  }

  return remainder;
};

 
export const ReminderService = {
  createReminder,
  getAllReminders,
 getReminderAndMakePaid,
};