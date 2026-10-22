import { prisma } from '../../config/prisma.ts';
import { AppError } from '../../middleware/error.middleware.ts';
import { addXp, updateStreak, checkAchievements } from '../../services/gamification.service.ts';
import { SubmitAttemptInput } from './tasks.schema.ts';

export async function getTask(taskId: string, studentId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      level: { include: { topic: { include: { course: true } } } },
    },
  });

  if (!task) {
    throw new AppError(404, 'Тапсырма табылмады');
  }

  const previousAttempts = await prisma.attempt.findMany({
    where: { studentId, taskId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    type: task.type,
    options: task.options,
    xpReward: task.xpReward,
    level: {
      id: task.level.id,
      title: task.level.title,
      course: task.level.topic.course.title,
    },
    previousAttempts,
  };
}

export async function submitAttempt(
  taskId: string,
  studentId: string,
  input: SubmitAttemptInput
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError(404, 'Тапсырма табылмады');
  }

  const isCorrect = task.correctAnswer === input.answer;

  const attempt = await prisma.attempt.create({
    data: {
      studentId,
      taskId,
      status: 'COMPLETED',
      answer: input.answer,
      isCorrect,
      score: isCorrect ? 100 : 0,
      timeSpent: input.timeSpent,
      completedAt: new Date(),
    },
  });

  let xpResult = null;
  let aiAdvice = null;
  let unlockedLevel = null;

  if (isCorrect) {
    const bonus = await checkFirstAttempt(studentId, taskId);
    const xpAmount = task.xpReward + (bonus ? 5 : 0);

    xpResult = await addXp({
      studentId,
      amount: xpAmount,
      reason: `Task completed: ${task.title}`,
      metadata: { taskId, levelId: task.levelId },
    });

    await updateStreak(studentId);

    // 🔓 ДЕҢГЕЙ АШУ ЛОГИКАСЫ
    unlockedLevel = await tryUnlockNextLevel(task.levelId, studentId);
  } else {
    aiAdvice = task.explanation || 'Қайталап көріңіз';
  }

  return {
    attemptId: attempt.id,
    isCorrect,
    correctAnswer: isCorrect ? undefined : task.correctAnswer,
    explanation: task.explanation,
    xp: xpResult,
    aiAdvice,
    unlockedLevel,
  };
}

// 🔓 Деңгей ашу функциясы
async function tryUnlockNextLevel(levelId: string, studentId: string) {
  // Осы деңгейдің барлық тапсырмалары
  const levelTasks = await prisma.task.findMany({
    where: { levelId },
    select: { id: true },
  });

  if (levelTasks.length === 0) return null;

  // Орындалған тапсырмалар
  const completed = await prisma.attempt.findMany({
    where: {
      studentId,
      taskId: { in: levelTasks.map((t) => t.id) },
      isCorrect: true,
    },
    distinct: ['taskId'],
  });

  // Барлығы орындалды ма?
  if (completed.length < levelTasks.length) return null;

  // Ағымдағы деңгей
  const currentLevel = await prisma.level.findUnique({
    where: { id: levelId },
  });

  if (!currentLevel) return null;

  // Келесі деңгей (сол topic ішінде)
  const nextLevel = await prisma.level.findFirst({
    where: {
      topicId: currentLevel.topicId,
      orderIndex: { gt: currentLevel.orderIndex },
    },
    orderBy: { orderIndex: 'asc' },
  });

  if (!nextLevel || !nextLevel.isLocked) return null;

  // Ашу
  const updated = await prisma.level.update({
    where: { id: nextLevel.id },
    data: { isLocked: false },
  });

  // Notification
  await prisma.notification.create({
    data: {
      userId: (await prisma.student.findUnique({ where: { id: studentId } }))!.userId,
      type: 'NEW_TASK',
      title: '🔓 Жаңа деңгей ашылды!',
      message: `"${updated.title}" деңгейі ашылды`,
      data: { levelId: updated.id },
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    xpReward: updated.xpReward,
  };
}

async function checkFirstAttempt(studentId: string, taskId: string): Promise<boolean> {
  const count = await prisma.attempt.count({
    where: { studentId, taskId, isCorrect: true },
  });
  return count === 1;
}

export async function getAttempts(studentId: string) {
  const attempts = await prisma.attempt.findMany({
    where: { studentId },
    include: {
      task: { select: { title: true, xpReward: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return attempts;
}