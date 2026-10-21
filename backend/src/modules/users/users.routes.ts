import { Router } from 'express';
import * as usersController from './users.controller.ts';
import { authenticate, authorize } from '../../middleware/auth.middleware.ts';

const router = Router();

router.get('/me', authenticate, usersController.getMe);
router.put('/me', authenticate, usersController.updateMe);
router.get('/students', authenticate, authorize('TEACHER', 'ADMIN'), usersController.listStudents);

export default router;