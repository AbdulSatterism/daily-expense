import { Prisma } from 'prisma/client/client';

export type IConsultation = Prisma.ConsultationCreateArgs['data'];
