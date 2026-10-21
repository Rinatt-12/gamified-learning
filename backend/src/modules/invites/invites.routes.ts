import { Router } from 'express';
import * as invitesController from './invites.controller.ts';
import { authenticate, authorize } from '../../middleware/auth.middleware.ts';

const router = Router();

// Public — invite кодты тексеру (register алдында)
router.get('/validate/:code', invitesController.validate);

// Admin only
router.post('/', authenticate, authorize('ADMIN'), invitesController.create);
router.get('/', authenticate, authorize('ADMIN'), invitesController.list);
router.delete('/:id', authenticate, authorize('ADMIN'), invitesController.revoke);

export default router;