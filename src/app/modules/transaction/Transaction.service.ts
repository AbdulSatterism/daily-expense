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




export const TransactionService = {
    createTransaction
};