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

  const recentTransactions = await prisma.transaction.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      date: 'desc',
    },
    take: 2,
  });

  return {
    monthly_income: Number(monthlyIncome.toFixed(2)),
    monthly_expense: Number(totalExpense.toFixed(2)),
    weekly_trend: weeklyData,
    category_wise_expense: categoryPercentage,
    recent_transactions: recentTransactions,
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
            expenses: transactions
        },
        meta: {
            page: pages,
            limit: size,
            totalPage,
            total,
        },
    };
};

const monthNameToNumber: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const getMonthNumber = (monthInput: unknown): number => {
  if (monthInput === undefined || monthInput === null) {
    return new Date().getMonth() + 1; // default current month
  }
  if (typeof monthInput === 'number') {
    if (monthInput < 1 || monthInput > 12) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Month must be between 1 and 12');
    }
    return monthInput;
  }
  if (typeof monthInput === 'string') {
    const key = monthInput.trim().toLowerCase();
    const monthNum = monthNameToNumber[key];
    if (!monthNum) {
      throw new AppError(StatusCodes.BAD_REQUEST, `Invalid month name: ${monthInput}`);
    }
    return monthNum;
  }
  throw new AppError(StatusCodes.BAD_REQUEST, 'Month must be a number or string');
};

const getFinanceReport = async (
  userId: string,
  query: Record<string, unknown> // { type?: string, month?: string | number, year?: number | string }
) => {
  // Extract and validate parameters
  const { type, month, year } = query;

  // Validate user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  // Determine period type (default to 'monthly')
  const periodType = typeof type === 'string' && (type === 'monthly' || type === 'yearly')
    ? type
    : 'monthly';

  // Parse year (default to current year)
  let targetYear: number;
  if (year === undefined || year === null) {
    targetYear = new Date().getFullYear();
  } else if (typeof year === 'number') {
    targetYear = year;
  } else if (typeof year === 'string' && /^\d{4}$/.test(year)) {
    targetYear = parseInt(year, 10);
  } else {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Year must be a valid 4-digit number');
  }

  if (periodType === 'monthly') {
    const targetMonth = getMonthNumber(month);

    // Date range for selected month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        date: { gte: startDate, lt: endDate },
      },
    });

    let totalIncome = 0, totalExpense = 0;
    const weeklyData = [
      { week: 1, income: 0, expense: 0, revenue: 0 },
      { week: 2, income: 0, expense: 0, revenue: 0 },
      { week: 3, income: 0, expense: 0, revenue: 0 },
      { week: 4, income: 0, expense: 0, revenue: 0 },
    ];
    const categoryExpense: Record<string, number> = {};

    transactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'INCOME') totalIncome += amount;
      else totalExpense += amount;

      const day = new Date(t.date).getDate();
      const week = Math.min(4, Math.ceil(day / 7));
      if (t.type === 'INCOME') {
        weeklyData[week - 1].income += amount;
      } else {
        weeklyData[week - 1].expense += amount;
        categoryExpense[t.category] = (categoryExpense[t.category] || 0) + amount;
      }
    });

    weeklyData.forEach(w => {
      w.revenue = w.income - w.expense;
    });

    const totalRevenue = totalIncome - totalExpense;

    const categoryPercentage: Record<string, number> = {};
    if (totalExpense > 0) {
      for (const [cat, amt] of Object.entries(categoryExpense)) {
        categoryPercentage[cat] = Number(((amt / totalExpense) * 100).toFixed(2));
      }
    }

    // Growth vs previous month
    let growthPercentage = 0;
    let prevRevenue = 0;
    if (targetMonth === 1) {
      const prevStart = new Date(targetYear - 1, 11, 1);
      const prevEnd = new Date(targetYear, 0, 1);
      const prevTransactions = await prisma.transaction.findMany({
        where: {
          user_id: userId,
          date: { gte: prevStart, lt: prevEnd },
        },
      });
      prevRevenue = prevTransactions.reduce((acc, t) => {
        return acc + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount));
      }, 0);
    } else {
      const prevStart = new Date(targetYear, targetMonth - 2, 1);
      const prevEnd = new Date(targetYear, targetMonth - 1, 1);
      const prevTransactions = await prisma.transaction.findMany({
        where: {
          user_id: userId,
          date: { gte: prevStart, lt: prevEnd },
        },
      });
      prevRevenue = prevTransactions.reduce((acc, t) => {
        return acc + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount));
      }, 0);
    }
    if (prevRevenue !== 0) {
      growthPercentage = Number(((totalRevenue - prevRevenue) / Math.abs(prevRevenue) * 100).toFixed(2));
    }

    return {
      period: 'monthly',
      month: targetMonth,
      year: targetYear,
      total_income: Number(totalIncome.toFixed(2)),
      total_expense: Number(totalExpense.toFixed(2)),
      total_revenue: Number(totalRevenue.toFixed(2)),
      growth_vs_last_month: {
        percentage: growthPercentage,
        revenue: Number(totalRevenue.toFixed(2)),
      },
      weekly_data: weeklyData.map(w => ({
        week: w.week,
        income: Number(w.income.toFixed(2)),
        expense: Number(w.expense.toFixed(2)),
        revenue: Number(w.revenue.toFixed(2)),
      })),
      category_wise_expense: categoryPercentage,
    };
  } else {
    // --- YEARLY REPORT ---
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear + 1, 0, 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        date: { gte: startDate, lt: endDate },
      },
    });

    let totalIncome = 0, totalExpense = 0;
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
      revenue: 0,
    }));
    const categoryExpense: Record<string, number> = {};

    transactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'INCOME') totalIncome += amount;
      else totalExpense += amount;

      const month = new Date(t.date).getMonth();
      if (t.type === 'INCOME') {
        monthlyData[month].income += amount;
      } else {
        monthlyData[month].expense += amount;
        categoryExpense[t.category] = (categoryExpense[t.category] || 0) + amount;
      }
    });

    monthlyData.forEach(m => {
      m.revenue = m.income - m.expense;
    });

    const totalRevenue = totalIncome - totalExpense;

    const categoryPercentage: Record<string, number> = {};
    if (totalExpense > 0) {
      for (const [cat, amt] of Object.entries(categoryExpense)) {
        categoryPercentage[cat] = Number(((amt / totalExpense) * 100).toFixed(2));
      }
    }

    // Growth vs previous year
    const prevStart = new Date(targetYear - 1, 0, 1);
    const prevEnd = new Date(targetYear, 0, 1);
    const prevTransactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        date: { gte: prevStart, lt: prevEnd },
      },
    });
    const prevRevenue = prevTransactions.reduce((acc, t) => {
      return acc + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount));
    }, 0);
    let growthPercentage = 0;
    if (prevRevenue !== 0) {
      growthPercentage = Number(((totalRevenue - prevRevenue) / Math.abs(prevRevenue) * 100).toFixed(2));
    }

    return {
      period: 'yearly',
      year: targetYear,
      total_income: Number(totalIncome.toFixed(2)),
      total_expense: Number(totalExpense.toFixed(2)),
      total_revenue: Number(totalRevenue.toFixed(2)),
      growth_vs_last_year: {
        percentage: growthPercentage,
        revenue: Number(totalRevenue.toFixed(2)),
      },
      monthly_data: monthlyData.map(m => ({
        month: m.month,
        income: Number(m.income.toFixed(2)),
        expense: Number(m.expense.toFixed(2)),
        revenue: Number(m.revenue.toFixed(2)),
      })),
      category_wise_expense: categoryPercentage,
    };
  }
};


/*
1. need total user, total active user (online true in user table), total inactive user (online false in user table)
2. total revenue for all user (sum of all income - sum of all expense)
3. total expense for all user (sum of all expense)

4. total income for all user (sum of all income)
5. net revenue as profit or loss (total income - total expense)
6. negetive cash flow for all user (total expense - total income) if total expense > total income then only show this data otherwise show 0
7. upcoming total reminders for all user (from reminder table where date is greater than current date)

8. current year total user count for every month (group by month and count user created in that month)

*/

// do all in here 

const dashboardHomeReport = async (userId:string) => {
const isAdmin = await prisma.user.findUnique({
    where: { id: userId },
});

if (!isAdmin || isAdmin?.role !== 'ADMIN') {
    throw new AppError(StatusCodes.FORBIDDEN, 'Access denied');
}

  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({ where: { online: true } });
  const inactiveUsers = await prisma.user.count({ where: { online: false } });
  
  const totalIncome = await prisma.transaction.aggregate({
    where: { type: 'INCOME' },
    _sum: { amount: true },
  });
  const totalExpense = await prisma.transaction.aggregate({
    where: { type: 'EXPENSE' },
    _sum: { amount: true },
  });
  const totalRevenue = (Number(totalIncome._sum.amount) || 0) - (Number(totalExpense._sum.amount) || 0);
  const negativeCashFlow = totalRevenue < 0 ? Math.abs(totalRevenue) : 0;
  const upcomingReminders = await prisma.reminder.count({
    where: { due_date: { gt: new Date() } },
  });
  const currentYearUserCount = await prisma.user.groupBy({
    by: ['created_at'],
    _count: { id: true },
  }); 


  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalIncome: Number((totalIncome._sum.amount || 0).toFixed(2)),
    totalExpense: Number((totalExpense._sum.amount || 0).toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    negativeCashFlow: Number(negativeCashFlow.toFixed(2)),
    upcomingReminders,
    currentYearUserCount: currentYearUserCount.map(item => ({
      month: item.created_at.getMonth() + 1,
      count: item._count.id,
    })),
  };
}




export const TransactionService = {
  createTransaction,
  getTransactionSummary,
  getTransactionById,
  getMonthlyTrend,
  monthlyFinanceList,
  getFinanceReport,
  dashboardHomeReport,
};
