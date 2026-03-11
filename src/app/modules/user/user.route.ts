/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { UserController } from './user.controller';
const router = express.Router();

router.post(
  '/create-user',
  UserController.createUser,
);

router.get('/all-user', auth(USER_ROLES.ADMIN), UserController.getAllUser);

router.patch(
  '/update-profile',
  fileUploadHandler({ image: { fileType: 'images', size: 5 * 1024 * 1024 } }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  UserController.updateProfile,
);

router.get(
  '/user',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  UserController.getUserProfile,
);

// router.get('/get-all-users', auth(USER_ROLES.ADMIN), UserController.getAllUser);



// searchAllUser
router.get(
  '/',
  auth(USER_ROLES.ADMIN),
  UserController.searchAllUser,
);

router.get(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  UserController.getUserProfile,
);


router.get(
  '/get-single-user/:id',
  auth(USER_ROLES.ADMIN),
  UserController.getSingleUser,
);


export const UserRoutes = router;
