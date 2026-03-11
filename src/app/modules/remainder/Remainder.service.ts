/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/util/db';
import { IRemainder } from './Remainder.interface';
import AppError from '@/app/errors/AppError';
import { StatusCodes } from 'http-status-codes';

const createReminder = async (userId: string, payload: IRemainder) => {
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

/*
1. total reminders all users total count
2. 1 week due reminders total count
3. overdue  reminders total count
4. all reminders list with pagination and filter by status (PAID, UNPAID) and month wise (jan, feb etc) 
*/

const reminderReports = async (query: Record<string, unknown>) => {
  const page = (query.page as number) || 1;
  const limit = (query.limit as number) || 10;
  const status = query.status as string;
  const month = query.month as string;
  const skip = (page - 1) * limit;

  const currentDate = new Date();
  const weekFromNow = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. Total reminders count
  const totalCount = await prisma.reminder.count();

  // 2. 1 week due reminders count
  const weekDueCount = await prisma.reminder.count({
    where: {
      due_date: { gte: currentDate, lte: weekFromNow },
      status: 'UNPAID',
    },
  });

  // 3. Overdue reminders count
  const overdueCount = await prisma.reminder.count({
    where: {
      due_date: { lt: currentDate },
      status: 'UNPAID',
    },
  });

  // 4. All reminders list with pagination and filters
  const whereClause: any = {};
  if (status) whereClause.status = status;
  if (month) {
    const monthNum = parseInt(month);
    const year = new Date().getFullYear();
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    whereClause.due_date = { gte: startDate, lte: endDate };
  }

  const reminders = await prisma.reminder.findMany({
    where: whereClause,
    skip,
    take: limit,
    orderBy: { due_date: 'asc' },
  });

  const totalReminders = await prisma.reminder.count({ where: whereClause });
  const totalPage = Math.ceil(totalReminders / limit);

  return {
    total_reminder: totalCount,
    week_due: weekDueCount,
    overdue: overdueCount,
    reminders,
    meta: {
      page,
      limit,
      totalPage,
      total: totalReminders,
    },
  };
};

export const ReminderService = {
  createReminder,
  getAllReminders,
  getReminderAndMakePaid,
  reminderReports,
};
