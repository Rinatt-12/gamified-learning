import { prisma } from '../../config/prisma.ts';
import { AppError } from '../../middleware/error.middleware.ts';

export async function listNotifications(userId: string, limit: number = 50) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return notifications;
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { count };
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError(404, 'Хабарлама табылмады');
  }
  if (notification.userId !== userId) {
    throw new AppError(403, 'Рұқсат жоқ');
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return updated;
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { message: 'Барлығы оқылды деп белгіленді' };
}

export async function createNotification(params: {
  userId: string;
  type: 'XP_GAINED' | 'LEVEL_UP' | 'ACHIEVEMENT' | 'NEW_TASK' | 'DAILY_GOAL' | 'AI_ADVICE' | 'TOURNAMENT';
  title: string;
  message?: string;
  data?: any;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || {},
    },
  });
}