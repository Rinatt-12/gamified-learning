import { Router } from 'express';
import * as aiController from './ai.controller.ts';
import { authenticate, authorize } from '../../middleware/auth.middleware.ts';

const router = Router();

router.post('/mistake-advice', authenticate, authorize('STUDENT'), aiController.mistakeAdvice);
router.get('/weak-topics', authenticate, authorize('STUDENT'), aiController.weakTopics);
router.get('/next-task', authenticate, authorize('STUDENT'), aiController.nextTask);
router.post('/generate-test', authenticate, authorize('TEACHER', 'ADMIN'), aiController.generateTest);

export default router;