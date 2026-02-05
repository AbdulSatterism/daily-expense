import { PrismaClient, Prisma, type ResetToken } from '../../../prisma/client/client';
import { EGender } from '../../../prisma/client/enums';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import config from '@/config';

/**
 * Prisma Client instance
 */
export const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new pg.Pool({
      connectionString: config.database_url,
    }),
  ),
});

export { Prisma, EGender };
export type { ResetToken };
