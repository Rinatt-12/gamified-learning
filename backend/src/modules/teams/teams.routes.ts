import { Router } from 'express';
import * as teamsController from './teams.controller.ts';
import { authenticate, authorize } from '../../middleware/auth.middleware.ts';

const router = Router();

router.get('/', authenticate, teamsController.list);
router.get('/my-team', authenticate, authorize('STUDENT'), teamsController.myTeam);
router.get('/:id', authenticate, teamsController.getById);
router.post('/', authenticate, authorize('STUDENT'), teamsController.create);
router.post('/:id/join', authenticate, authorize('STUDENT'), teamsController.join);
router.post('/leave', authenticate, authorize('STUDENT'), teamsController.leave);

export default router;