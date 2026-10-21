import { Router } from 'express';
import * as leaderboardController from './leaderboard.controller.ts';
import { authenticate } from '../../middleware/auth.middleware.ts';

const router = Router();

router.get('/global', authenticate, leaderboardController.global);
router.get('/course/:courseId', authenticate, leaderboardController.course);
router.get('/team', authenticate, leaderboardController.team);

export default router;