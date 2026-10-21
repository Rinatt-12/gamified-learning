import { prisma } from '../config/prisma.ts';
import { calculateLevel, xpForNextLevel } from '../utils/xp.utils.ts';

interface AddXpOptions {
  studentId: string;
  amount: number;
  reason: string;
  metadata?: any;
}

export async function addXp({ studentId, amount, reason, metadata }: AddXpOptions) {
  // 1. XP event жазу
  await prisma.xpEvent.create({
    data: {
      studentId,
      amount,
      reason,
      metadata: metadata || {},
    },
  });

  // 2. Student XP-ін жаңарту
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) throw new Error('Student табылмады');

  const newXp = student.xp + amount;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > student.level;

  const updated = await prisma.student.update({
    where: { id: studentId },
    data: {
      xp: newXp,
      level: newLevel,
      lastActive: new Date(),
    },
  });

  // 3. Level up болса — notification
  if (leveledUp) {
    await prisma.notification.create({
      data: {
        userId: student.userId,
        type: 'LEVEL_UP',
        title: `🎉 Level ${newLevel}!`,
        message: `Сіз ${newLevel}-деңгейге көтерілдіңіз!`,
        data: { level: newLevel },
      },
    });
  }

  // 4. Achievement тексеру
  await checkAchievements(studentId);

  return {
    xp: updated.xp,
    level: updated.level,
    leveledUp,
    xpAdded: amount,
  };
}

export async function checkAchievements(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      attempts: { where: { isCorrect: true } },
      achievements: true,
      streak: true,
    },
  });

  if (!student) return;

  const achievements = await prisma.achievement.findMany({
    where: { isActive: true },
  });

  const unlockedIds = student.achievements.map((a) => a.achievementId);

  for (const achievement of achievements) {
    if (unlockedIds.includes(achievement.id)) continue;

    const condition = achievement.condition as any;
    let shouldUnlock = false;

    switch (condition?.type) {
      case 'TASKS_COMPLETED':
        shouldUnlock = student.attempts.length >= condition.value;
        break;
      case 'LEVEL_REACHED':
        shouldUnlock = student.level >= condition.value;
        break;
      case 'STREAK_DAYS':
        shouldUnlock = (student.streak?.currentDays || 0) >= condition.value;
        break;
      case 'PERFECT_LEVEL':
        // Кейін қосамыз
        break;
    }

    if (shouldUnlock) {
      await prisma.studentAchievement.create({
        data: {
          studentId,
          achievementId: achievement.id,
        },
      });

      // Achievement XP
      if (achievement.xpReward > 0) {
        await prisma.student.update({
          where: { id: studentId },
          data: { xp: { increment: achievement.xpReward } },
        });
      }

      // Notification
      await prisma.notification.create({
        data: {
          userId: student.userId,
          type: 'ACHIEVEMENT',
          title: `${achievement.icon} ${achievement.title}`,
          message: achievement.description || '',
          data: { achievementCode: achievement.code },
        },
      });
    }
  }
}

export async function updateStreak(studentId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await prisma.streak.findUnique({ where: { studentId } });

  if (!streak) {
    return prisma.streak.create({
      data: {
        studentId,
        currentDays: 1,
        longestDays: 1,
        lastCheckIn: new Date(),
      },
    });
  }

  const lastCheck = new Date(streak.lastCheckIn);
  lastCheck.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return streak; // Бүгін тексерілген
  }

  if (diffDays === 1) {
    // Кеше — streak жалғасады
    const newDays = streak.currentDays + 1;
    return prisma.streak.update({
      where: { studentId },
      data: {
        currentDays: newDays,
        longestDays: Math.max(newDays, streak.longestDays),
        lastCheckIn: new Date(),
      },
    });
  }

  // 1 күннен көп үзіліс — streak қайта басталады
  return prisma.streak.update({
    where: { studentId },
    data: {
      currentDays: 1,
      lastCheckIn: new Date(),
    },
  });
}

export async function getGamificationStats(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      streak: true,
      achievements: { include: { achievement: true } },
      xpEvents: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });

  if (!student) throw new Error('Student табылмады');

  const nextLevelXp = xpForNextLevel(student.level);
  const currentLevelStartXp = student.level > 1 ? xpForNextLevel(student.level - 1) : 0;

  return {
    xp: student.xp,
    level: student.level,
    nextLevelXp,
    levelProgress: {
      current: student.xp - currentLevelStartXp,
      needed: nextLevelXp,
      percent: Math.min(100, Math.round(((student.xp - currentLevelStartXp) / nextLevelXp) * 100)),
    },
    streak: student.streak,
    achievements: student.achievements,
    recentXp: student.xpEvents,
  };
}