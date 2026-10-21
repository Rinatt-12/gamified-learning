import { Router } from 'express';
import * as analyticsController from './analytics.controller.ts';
import { authenticate, authorize } from '../../middleware/auth.middleware.ts';

const router = Router();

router.get('/student/me', authenticate, authorize('STUDENT'), analyticsController.studentProgress);
router.get('/teacher/me', authenticate, authorize('TEACHER'), analyticsController.teacherAnalytics);
router.get('/admin', authenticate, authorize('ADMIN'), analyticsController.adminAnalytics);

export default router;