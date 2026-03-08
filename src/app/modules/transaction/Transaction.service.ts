/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/util/db';
import { ICreateTransaction } from './Transaction.interface';
import AppError from '@/app/errors/AppError';
import { StatusCodes } from 'http-status-codes';


const createTransaction = async (
  userId: string,
  payload: ICreateTransaction,
) => {
  payload.user_id = userId;

  const isExistUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'user not found!');
  }

  const result = await prisma.transaction.create({
    data: payload,
  });
  return result;
};

// get single transaction
const getTransactionById = async (userId: string, transactionId: string) => {
  const isExistUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'user not found!');
  }

  const result = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      user_id: userId,
    },
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'transaction not found!');
  }

  return result;
};

// need total income , expense, and another data which will be revenue= income - expense

const getTransactionSummary = async (userId: string) => {
  const isExistUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'user not found!');
  }

  // return  total income , expense and revenue

  const totalIncome = await prisma.transaction.aggregate({
    where: {
      user_id: userId,
      type: 'INCOME',
    },
    _sum: {
      amount: true,
    },
  });

  const totalExpense = await prisma.transaction.aggregate({
    where: {
      user_id: userId,
      type: 'EXPENSE',
    },
    _sum: {
      amount: true,
    },
  });

  const incomeAmount = (totalIncome._sum.amount as unknown as number) || 0;
  const expenseAmount = (totalExpense._sum.amount as unknown as number) || 0;
  const revenue = incomeAmount - expenseAmount;

  return {
    income: Number(incomeAmount.toFixed(2)),
    expense: Number(expenseAmount.toFixed(2)),
    revenue: Number(revenue.toFixed(2)),
  };
};

const getMonthlyTrend = async (userId: string) => {
  const isExistUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'user not found!');
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: userId,
      date: {
        gte: new Date(currentYear, currentMonth, 1),
        lt: new Date(currentYear, currentMonth + 1, 1),
      },
    },
  });

  const weeklyData = [
    { week: 1, expense: 0 },
    { week: 2, expense: 0 },
    { week: 3, expense: 0 },
    { week: 4, expense: 0 },
  ];

  const monthlyIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryWiseExpense: { [key: string]: number } = {};

  transactions.forEach(transaction => {
    if (transaction.type === 'EXPENSE') {
      const day = new Date(transaction.date).getDate();
      const week = Math.ceil(day / 7);

      if (week >= 1 && week <= 4) {
        weeklyData[week - 1].expense += Number(transaction.amount);
      }

      categoryWiseExpense[transaction.category] =
        (categoryWiseExpense[transaction.category] || 0) +
        Number(transaction.amount);
    }
  });

  const categoryPercentage = Object.entries(categoryWiseExpense).reduce(
    (acc, [category, amount]) => {
      acc[category] =
        totalExpense > 0
          ? parseFloat(((amount / totalExpense) * 100).toFixed(2))
          : 0;
      return acc;
    },
    {} as { [key: string]: number },
  );

  return {
    monthly_income: Number(monthlyIncome.toFixed(2)),
    monthly_expense: Number(totalExpense.toFixed(2)),
    weekly_trend: weeklyData,
    category_wise_expense: categoryPercentage,
  };
};

//  monthly expense like march 2026 => 03-2026  so this month total expense, and all expense data 
const monthlyFinanceList = async (userId: string, query: Record<string, unknown>) => {
    const { page, limit, month, year, category } = query;
    const pages = parseInt(page as string) || 1;
    const size = parseInt(limit as string) || 10;
    const skip = (pages - 1) * size;

    const isExistUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!isExistUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'user not found!');
    }
    const whereCondition: any = {
        user_id: userId,
        type: 'EXPENSE',
        date: {
            gte: new Date(Number(year), Number(month) - 1, 1),
            lt: new Date(Number(year), Number(month), 1),
        },
    };
    if (category) {
        whereCondition.category = (category as string).toUpperCase();
    }
    const transactions = await prisma.transaction.findMany({
        where: whereCondition,
        skip,
        take: size,
        orderBy: {
            date: 'desc'
        }
    });

    const total = await prisma.transaction.count({
        where: whereCondition,
    });

    const totalPage = Math.ceil(total / size);

    const monthlyTotalExpense = await prisma.transaction.aggregate({
        where: whereCondition,
        _sum: {
            amount: true,
        },
    });

    const prevMonth = Number(month) === 1 ? 12 : Number(month) - 1;
    const prevYear = Number(month) === 1 ? Number(year) - 1 : Number(year);

    const previousMonthWhere: any = {
        user_id: userId,
        type: 'EXPENSE',
        date: {
            gte: new Date(prevYear, prevMonth - 1, 1),
            lt: new Date(prevYear, prevMonth, 1),
        },
    };

    if (category) {
        previousMonthWhere.category = (category as string).toUpperCase();
    }
    const previousMonthTotalExpense = await prisma.transaction.aggregate({
        where: previousMonthWhere,
        _sum: {
            amount: true,
        },
    });

    const monthlyTotal = (monthlyTotalExpense._sum.amount as unknown as number) || 0;
    const previousMonthTotal = (previousMonthTotalExpense._sum.amount as unknown as number) || 0;

    let percentageChange = 0;
    if (previousMonthTotal > 0) {
        percentageChange = ((monthlyTotal - previousMonthTotal) / previousMonthTotal) * 100;
    }

    return {
        success: true,
        data: {
            monthly_expense: Number(monthlyTotal.toFixed(2)),
            previous_month_expense: Number(previousMonthTotal.toFixed(2)),
            percentage_change: Number(percentageChange.toFixed(2)),
            expenses: transactions,
            filters: {
                month: Number(month),
                year: Number(year),
                category: category || null
            }
        },
        meta: {
            page: pages,
            limit: size,
            totalPage,
            total,
        },
    };
};

export const TransactionService = {
  createTransaction,
  getTransactionSummary,
  getTransactionById,
  getMonthlyTrend,
  monthlyFinanceList,
};
