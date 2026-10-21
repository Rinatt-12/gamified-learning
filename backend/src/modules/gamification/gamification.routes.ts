import { Router } from 'express';
import * as gamificationController from './gamification.controller.ts';
import { authenticate, authorize } from '../../middleware/auth.middleware.ts';

const router = Router();

router.get('/me', authenticate, authorize('STUDENT'), gamificationController.myStats);

export default router;