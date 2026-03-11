import { Router } from 'express';
import { GuestController } from './Guest.controller';
import auth from '@/app/middlewares/auth';
import { USER_ROLES } from '@/enums/user';

const router = Router();

router.post('/', GuestController.createGuestCapitalApplication);

router.get('/',auth(USER_ROLES.ADMIN), GuestController.allApplications);
router.get('/:id',auth(USER_ROLES.ADMIN), GuestController.singleApplication);

export const GuestRoutes = router;
