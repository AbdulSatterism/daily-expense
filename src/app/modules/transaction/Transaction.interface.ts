import type {Prisma} from '@/util/db'

export enum TransactionType {
   'INCOME',
    'EXPENSE'
}

export enum Category {
    'GROCERIES',
    'RENT',
    'TRANSPORT',
    'UTILITIES',
    'SHOPPING',
    'HEALTH',
    'FOOD',
    'GAS',
    'SALARY',
    'BUSINESS',
    'INVESTMENT',
    'OTHER',
    'ZAKAT',
    'TAX'
}


export type  ICreateTransaction = Prisma.TransactionCreateArgs["data"]



export interface IUpdateTransaction {
    type?: TransactionType;
    amount?: number;
    category?: Category;
    notes?: string;
    date?: Date;
    image?: string;
    document?: string;
}