import { Router } from 'express';
import { ConsultationController } from './Consultation.controller';
import auth from '@/app/middlewares/auth';
import { USER_ROLES } from '@/enums/user';

const router = Router();

router.post('/', ConsultationController.createConsultation);

router.get('/',   auth(USER_ROLES.ADMIN), ConsultationController.getAllConsultations);
router.get('/:id',   auth(USER_ROLES.ADMIN), ConsultationController.singleConsultation);

export const ConsultationRoutes = router;
