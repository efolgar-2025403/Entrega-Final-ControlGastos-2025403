import { Router } from 'express';

import {
  createIncomeController,
  getIncomesController,
  getIncomeByIdController,
  updateIncomeController,
  deleteIncomeController
} from '../controllers/income.controller.js';

import {
  authenticateToken
} from '../../auth/middlewares/auth.middleware.js';


const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  getIncomesController
);

router.get(
  '/:id',
  getIncomeByIdController
);

router.post(
  '/',
  createIncomeController
);

router.put(
  '/:id',
  updateIncomeController
);

router.delete(
  '/:id',
  deleteIncomeController
);


export default router;