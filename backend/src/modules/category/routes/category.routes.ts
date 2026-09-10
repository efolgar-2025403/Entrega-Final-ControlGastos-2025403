import { Router } from 'express';

import {
  CategoryController
} from '../controllers/category.controller.js';

import {
  authenticateToken
} from '../../auth/middlewares/auth.middleware.js';


const router = Router();

const categoryController =
  new CategoryController();


router.use(authenticateToken);


// Obtener todas
router.get(
  '/',
  categoryController.getAll
);


// Obtener una
router.get(
  '/:id',
  categoryController.getById
);


// Crear
router.post(
  '/',
  categoryController.create
);


// Actualizar
router.put(
  '/:id',
  categoryController.update
);


// Eliminar
router.delete(
  '/:id',
  categoryController.delete
);


export default router;