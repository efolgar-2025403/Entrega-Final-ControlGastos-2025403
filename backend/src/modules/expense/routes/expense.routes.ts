import { Router } from 'express';

import {
  createExpenseController,
  getExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  deleteExpenseController
} from '../controllers/expense.controller.js';

import { authenticateToken } from '../../auth/middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getExpensesController);
router.get('/:id', getExpenseByIdController);
router.post('/', createExpenseController);
router.put('/:id', updateExpenseController);
router.delete('/:id', deleteExpenseController);

export default router;