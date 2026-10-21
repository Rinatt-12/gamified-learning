import { Router } from 'express';
import * as coursesController from './courses.controller.ts';
import { authenticate } from '../../middleware/auth.middleware.ts';

const router = Router();

router.get('/', authenticate, coursesController.list);
router.get('/:id', authenticate, coursesController.getById);
router.get('/levels/:levelId', authenticate, coursesController.getLevel);

export default router;