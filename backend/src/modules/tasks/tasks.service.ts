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

  // Бұрынғы әрекеттер
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
    // correctAnswer мен explanation ЖІБЕРІЛМЕЙДІ! (тексеру серверде)
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

  // Attempt жазу
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

  if (isCorrect) {
    // XP беру (серверде!)
    const bonus = await checkFirstAttempt(studentId, taskId);
    const xpAmount = task.xpReward + (bonus ? 5 : 0);

    xpResult = await addXp({
      studentId,
      amount: xpAmount,
      reason: `Task completed: ${task.title}`,
      metadata: { taskId, levelId: task.levelId },
    });

    // Streak update
    await updateStreak(studentId);
  } else {
    // Қате — AI кеңес (кейін AI модулінде)
    // Қазір тек explanation
    aiAdvice = task.explanation || 'Қайталап көріңіз';
  }

  return {
    attemptId: attempt.id,
    isCorrect,
    correctAnswer: isCorrect ? undefined : task.correctAnswer,
    explanation: task.explanation,
    xp: xpResult,
    aiAdvice,
  };
}

async function checkFirstAttempt(studentId: string, taskId: string): Promise<boolean> {
  const count = await prisma.attempt.count({
    where: { studentId, taskId, isCorrect: true },
  });
  return count === 1; // Бұл — бірінші дұрыс әрекет
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