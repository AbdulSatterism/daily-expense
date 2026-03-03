import {
  PrismaClient,
  Prisma,
  type ResetToken,
} from '../../../prisma/client/client';
import { EGender } from '../../../prisma/client/enums';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import config from '@/config';

const pool = new pg.Pool({
  connectionString: config.database_url,
});

/**
 * Prisma Client instance
 */
export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

export { Prisma, EGender };
export type { ResetToken };
