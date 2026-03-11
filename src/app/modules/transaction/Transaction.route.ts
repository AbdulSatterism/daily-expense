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




router.get(
  '/summary',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  TransactionController.getTransactionSummary,
);

router.get(
  '/trend',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  TransactionController.getMonthlyTrend,
);

router.get(
  '/monthly-expense',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  TransactionController.monthlyFinanceList,
);


router.get(
  '/finance-report',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  TransactionController.getFinanceReport,
);

router.get(
  '/dashboard-report',
  auth(USER_ROLES.ADMIN),
  TransactionController.dashboardHomeReport,
);  

router.get(
  '/report/:userId',
  auth( USER_ROLES.ADMIN),
  TransactionController.getFinanceReportForUser,
);


router.get(
  '/income/:userId',
  auth( USER_ROLES.ADMIN),
  TransactionController.incomeReportForUser,
);

router.get(
  '/expense/:userId',
  auth( USER_ROLES.ADMIN),
  TransactionController.expenseReportForUser,
);

router.get(
  '/profit-loss/:userId',
  auth( USER_ROLES.ADMIN),
  TransactionController.profitAndLoss,
);

router.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  TransactionController.getTransactionById,
);



export const TransactionRoutes = router;
