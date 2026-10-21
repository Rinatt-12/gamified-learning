import { Router } from 'express';
import * as tasksController from './tasks.controller.ts';
import { authenticate, authorize } from '../../middleware/auth.middleware.ts';

const router = Router();

router.get('/my-attempts', authenticate, tasksController.myAttempts);
router.get('/:id', authenticate, authorize('STUDENT'), tasksController.getById);
router.post('/:id/attempt', authenticate, authorize('STUDENT'), tasksController.submit);

export default router;