import { Router } from 'express';
import * as authController from './auth.controller.ts';
import { authenticate } from '../../middleware/auth.middleware.ts';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;