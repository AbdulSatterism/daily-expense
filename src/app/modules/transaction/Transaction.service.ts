import { prisma} from '@/util/db';
import { ICreateTransaction } from './Transaction.interface';

const createTransaction = async (userId: string, payload: ICreateTransaction) => {

    payload.user_id = userId; 
    
    // payload.user = { connect: { id: userId } };
    const result = await prisma.transaction.create({    
        data:payload
    });
    return result;  
};