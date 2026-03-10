import { Router } from "express";
import auth from "@/app/middlewares/auth";
import { USER_ROLES } from "@/enums/user";
import { ReminderController } from "./Remainder.controller";

const router = Router();

router.post(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  ReminderController.createReminder,
);

router.get(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  ReminderController.getAllReminders,
);


router.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  ReminderController.getReminderAndMakePaid,
);

export const ReminderRoutes = router;