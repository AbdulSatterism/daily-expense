import auth from '@/app/middlewares/auth';
import { USER_ROLES } from '@/enums/user';
import { Router } from 'express';
import { TransactionController } from './Transaction.controller';
import fileUploadHandler from '@/app/middlewares/fileUploadHandler';

const router = Router();

router.post(
  '/',
  fileUploadHandler({
    image: { fileType: 'images', size: 50 * 1024 * 1024 },
    document: { fileType: 'documents', size: 50 * 1024 * 1024 },
  }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  TransactionController.createTransaction,
);

export const TransactionRoutes = router;
