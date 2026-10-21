import { Router } from 'express';
import * as notificationsController from './notifications.controller.ts';
import { authenticate } from '../../middleware/auth.middleware.ts';

const router = Router();

router.get('/', authenticate, notificationsController.list);
router.get('/unread-count', authenticate, notificationsController.unreadCount);
router.patch('/:id/read', authenticate, notificationsController.markRead);
router.patch('/read-all', authenticate, notificationsController.markAllRead);

export default router;