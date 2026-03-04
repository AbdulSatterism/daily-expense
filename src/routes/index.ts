import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { TransactionRoutes } from '@/app/modules/transaction/Transaction.route';

const router = express.Router();

const apiRoutes = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/transaction', route: TransactionRoutes },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
