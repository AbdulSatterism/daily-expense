import { prisma} from '@/util/db';
import { ICreateTransaction } from './Transaction.interface';
import AppError from '@/app/errors/AppError';
import { StatusCodes } from 'http-status-codes';

const createTransaction = async (userId: string, payload: ICreateTransaction) => {

    payload.user_id = userId; 

    const isExistUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!isExistUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'user not found!');
    }
    
    const result = await prisma.transaction.create({    
        data:payload
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
}

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
}

/*
// need montly trend of for current month .. where have 1s week , 2nd week, 3rd week and 4th week and total income and expense for each week, suppose this month total income 5000  so this month expense limit max 5000, so 1st week expense calculate and data show, 2nd week expense calculate and data show, 3rd week expense calculate and data show, 4th week expense calculate and data show,
// and also show all expense   with category wise with percentage 
const getMonthlyTrend = async (userId: string) => {
    const isExistUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    console.log('isExistUser', isExistUser);

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

    // Initialize weekly data
    const weeklyData = {
        week1: { income: 0, expense: 0 },
        week2: { income: 0, expense: 0 },
        week3: { income: 0, expense: 0 },
        week4: { income: 0, expense: 0 },
    };

    const monthlyIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryWiseExpense: { [key: string]: number } = {};

    // Process transactions
    transactions.forEach((transaction) => {
        const day = new Date(transaction.date).getDate();
        const week = Math.ceil(day / 7);
        const weekKey = `week${week}` as keyof typeof weeklyData;

        if (transaction.type === 'INCOME') {
            weeklyData[weekKey].income += Number(transaction.amount);
        } else {
            weeklyData[weekKey].expense += Number(transaction.amount);
            categoryWiseExpense[transaction.category] = 
                (categoryWiseExpense[transaction.category] || 0) + Number(transaction.amount);
        }
    });

    const totalExpense = Object.values(categoryWiseExpense).reduce((a, b) => a + b, 0);

    const categoryPercentage = Object.entries(categoryWiseExpense).reduce((acc, [category, amount]) => {
        acc[category] = totalExpense > 0 ? parseFloat(((amount / totalExpense) * 100).toFixed(2)) : 0;
        return acc;
    }, {} as { [key: string]: number });

    return {
        monthly_income: Number(monthlyIncome.toFixed(2)),
        weekly_trend: weeklyData,
        monthly_expense: Number(totalExpense.toFixed(2)),
        category_wise_expense: categoryPercentage,
    };
};

*/
export const TransactionService = {
    createTransaction,
    getTransactionSummary,
    getTransactionById,
};