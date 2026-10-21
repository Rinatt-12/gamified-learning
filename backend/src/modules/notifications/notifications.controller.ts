import { Request, Response, NextFunction } from 'express';
import * as notificationsService from './notifications.service.ts';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const notifications = await notificationsService.listNotifications(req.user!.id, limit);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function unreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationsService.getUnreadCount(req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationsService.markAsRead(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationsService.markAllAsRead(req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}