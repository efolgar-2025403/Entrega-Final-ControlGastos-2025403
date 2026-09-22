import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller.js';

import {
  authenticateToken
} from '../middlewares/auth.middleware.js';

const router = Router();

const controller =
  new AuthController();

router.post(
  '/register',
  controller.register
);

router.post(
  '/login',
  controller.login
);

router.post(
  '/google',
  controller.googleLogin
);

router.get(
  '/google/config',
  controller.getGoogleConfig
);

router.post(
  '/refresh',
  authenticateToken,
  controller.refresh
);

export default router;